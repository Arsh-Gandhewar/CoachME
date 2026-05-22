import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { paymentAPI } from '../../services/endpoints';
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '../../store/authStore';
import Constants from 'expo-constants';

export default function PaymentScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await paymentAPI.getMethods();
      if (res.data?.data?.items) {
        setMethods(res.data.data.items);
      }
    } catch (error) {
      console.log('Fetch methods error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAddMethod = async () => {
    if (Platform.OS === 'web') {
      window.alert('Razorpay Checkout requires a native device build.');
      return;
    }
    
    try {
      setLoading(true);
      // 1. Create a 1 INR setup order on backend
      const res = await paymentAPI.setupCard();
      const { orderId, customerId } = res.data.data;

      // 2. Open Razorpay Checkout to vault card
      const options = {
        description: 'Card Vault Verification',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: Constants.expoConfig?.extra?.razorpayKeyId || 'rzp_test_SsFnemBCyZjsKV',
        amount: '100', // 1 INR
        name: 'CoachME',
        order_id: orderId,
        customer_id: customerId,
        prefill: {
          email: (user as any)?.email || '',
          contact: (user as any)?.mobile || '9999999999',
          name: (user as any)?.name || (user as any)?.fullName || ''
        },
        theme: { color: '#FF5722' }
      };

      RazorpayCheckout.open(options).then((data: any) => {
        // Card saved successfully
        Alert.alert('Success', 'Payment method saved successfully.');
        fetchMethods();
      }).catch((error: any) => {
        // Handled or dismissed
        console.log('Checkout Error:', error);
      });
    } catch (error) {
      console.log('Setup Card error', error);
      Alert.alert('Error', 'Failed to initialize setup.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (tokenId: string) => {
    try {
      setLoading(true);
      await paymentAPI.deleteMethod(tokenId);
      setMethods(prev => prev.filter(m => m.id !== tokenId));
    } catch (error) {
      console.log('Delete method error', error);
      Alert.alert('Error', 'Failed to remove method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {loading && methods.length === 0 ? (
          <ActivityIndicator size="large" color="#FF5722" style={{ marginTop: 40 }} />
        ) : methods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No saved payment methods</Text>
          </View>
        ) : (
          methods.map((method) => {
            const card = method.card || {};
            return (
              <View key={method.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{card.network || 'Card'} ending in {card.last4 || '****'}</Text>
                </View>
                <Text style={styles.expiry}>Expires {card.expiry_month}/{card.expiry_year}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(method.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddMethod} disabled={loading}>
          {loading && methods.length > 0 ? (
            <ActivityIndicator size="small" color="#FF5722" />
          ) : (
            <>
              <Text style={styles.addIcon}>+</Text>
              <Text style={styles.addText}>Add New Payment Method</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  content: { padding: 20 },
  
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },

  card: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  expiry: { color: '#9E9E9E', fontSize: 14, marginBottom: 16 },
  removeBtn: { alignSelf: 'flex-start' },
  removeText: { color: '#F44336', fontSize: 14, fontWeight: '500' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FF5722', borderStyle: 'dashed' },
  addIcon: { color: '#FF5722', fontSize: 24, marginRight: 8, marginTop: -4 },
  addText: { color: '#FF5722', fontSize: 16, fontWeight: '600' },
});
