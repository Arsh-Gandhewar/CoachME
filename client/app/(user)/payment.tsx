import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CreditCard, Plus, Trash2 } from 'lucide-react-native';
import { paymentAPI } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import Constants from 'expo-constants';
import { theme } from '../../constants/colors';
import { RAZORPAY_KEY } from '../../constants/config';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader';
import Button from '../../components/Button';

// Guard RazorpayCheckout for web
let RazorpayCheckout: any = null;
if (Platform.OS !== 'web') {
  try { RazorpayCheckout = require('react-native-razorpay').default; } catch {}
}

export default function PaymentScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = async () => {
    try { setLoading(true); const res = await paymentAPI.getMethods(); if (res.data?.data?.items) setMethods(res.data.data.items); }
    catch (error) { console.error('Fetch methods error', error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleAddMethod = async () => {
    if (Platform.OS === 'web') { window.alert('Razorpay Checkout requires a native device build.'); return; }
    if (!RazorpayCheckout) { Alert.alert('Error', 'Razorpay not available'); return; }
    try {
      setLoading(true);
      const res = await paymentAPI.setupCard();
      const { orderId, customerId } = res.data.data;
      const options = {
        description: 'Card Vault Verification', image: 'https://i.imgur.com/3g7nmJC.png', currency: 'INR',
        key: RAZORPAY_KEY, amount: '100', name: 'CoachME',
        order_id: orderId, customer_id: customerId,
        prefill: { email: (user as any)?.email || '', contact: (user as any)?.mobile || '9999999999', name: (user as any)?.name || (user as any)?.fullName || '' },
        theme: { color: '#7C4DFF' }
      };
      RazorpayCheckout.open(options).then(() => { Alert.alert('Success', 'Payment method saved successfully.'); fetchMethods(); }).catch((error: any) => console.error('Checkout Error:', error));
    } catch (error) { console.error('Setup Card error', error); Alert.alert('Error', 'Failed to initialize setup.'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (tokenId: string) => {
    try { setLoading(true); await paymentAPI.deleteMethod(tokenId); setMethods(prev => prev.filter(m => m.id !== tokenId)); }
    catch (error) { console.error('Delete method error', error); Alert.alert('Error', 'Failed to remove method'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper>
      <Header title="Payment Methods" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      {loading && methods.length === 0 ? (
        <SkeletonLoader variant="card" count={2} />
      ) : methods.length === 0 ? (
        <EmptyState icon={<CreditCard size={40} color={theme.text.muted} />} title="No saved payment methods" subtitle="Add a card to enable quick bookings" />
      ) : (
        methods.map((method, i) => {
          const card = method.card || {};
          return (
            <Animated.View key={method.id} entering={FadeInDown.duration(300).delay(i * 80)}>
              <Card style={styles.cardItem}>
                <View style={styles.cardRow}>
                  <View style={styles.cardIconWrap}><CreditCard size={20} color={theme.accent.purple} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{card.network || 'Card'} •••• {card.last4 || '****'}</Text>
                    <Text style={styles.cardExpiry}>Expires {card.expiry_month}/{card.expiry_year}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(method.id)} style={styles.removeBtn}>
                    <Trash2 size={18} color={theme.status.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>
          );
        })
      )}

      <View style={{ height: spacing.xl }} />
      <TouchableOpacity style={styles.addBtn} onPress={handleAddMethod} disabled={loading} activeOpacity={0.7}>
        <Plus size={20} color={theme.accent.purple} />
        <Text style={styles.addText}>Add New Payment Method</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardItem: { marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: theme.accent.purpleLight, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  cardTitle: { ...typography.bodyMedium, color: theme.text.primary },
  cardExpiry: { ...typography.caption, color: theme.text.muted, marginTop: spacing.xs },
  removeBtn: { padding: spacing.sm },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: theme.accent.purple, borderStyle: 'dashed', gap: spacing.sm },
  addText: { ...typography.bodyMedium, color: theme.accent.purple },
});
