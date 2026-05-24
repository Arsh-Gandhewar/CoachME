import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { bookingAPI, subscriptionAPI, authAPI } from '../../../services/endpoints';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';
import { Lock, Eye, Users, MessageSquare, TrendingUp, Calendar } from 'lucide-react-native';
import { BlurView } from 'expo-blur'; // Will use generic opacity overlay if blur fails

export default function TrainerDashboard() {
  const { user, setUser } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const isSubscribed = (user as any)?.subscriptionStatus === 'active';

  const fetchData = async () => {
    try {
      const res = await bookingAPI.getTrainerBookings();
      setBookings(res.data.data || []);
    } catch {}
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      if (res.data?.data) {
        setUser(res.data.data);
      }
    } catch (error) {
      console.error('Refresh profile failed', error);
    }
  }

  useEffect(() => { fetchData(); }, []);
  
  const onRefresh = async () => { 
    setRefreshing(true); 
    await fetchData(); 
    await refreshProfile();
    setRefreshing(false); 
  };

  const handleSubscribe = async () => {
    if (Platform.OS === 'web') {
      window.alert('Razorpay Checkout requires a native device build (EAS).');
      return;
    }

    try {
      setSubscribing(true);
      const res = await subscriptionAPI.createTrainerSubscription();
      const { subscriptionId } = res.data.data;

      if (subscriptionId.startsWith('sub_mock_')) {
        // Simulate a successful checkout locally to bypass Razorpay SDK errors with fake keys
        try {
          await subscriptionAPI.verifyTrainerSubscription({
            razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9),
            razorpaySubscriptionId: subscriptionId,
            razorpaySignature: 'mock_signature',
          });
          Alert.alert('Success', 'Your profile is now live and visible to clients! (Mock Payment)');
          refreshProfile();
        } catch (verErr) {
          Alert.alert('Verification Failed', 'Please contact support.');
        }
        setSubscribing(false);
        return;
      }

      const options = {
        description: 'CoachME Premium Visibility',
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: Constants.expoConfig?.extra?.razorpayKeyId || 'rzp_test_SsFnemBCyZjsKV',
        name: 'CoachME',
        subscription_id: subscriptionId,
        prefill: {
          email: (user as any)?.email || '',
          contact: (user as any)?.mobile || '9999999999',
          name: (user as any)?.name || (user as any)?.fullName || ''
        },
        theme: { color: '#9D00FF' }
      };

      RazorpayCheckout.open(options).then(async (data: any) => {
        // Verify payment
        try {
          await subscriptionAPI.verifyTrainerSubscription({
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySubscriptionId: data.razorpay_subscription_id,
            razorpaySignature: data.razorpay_signature,
          });
          Alert.alert('Success', 'Your profile is now live and visible to clients!');
          refreshProfile();
        } catch (verErr) {
          Alert.alert('Verification Failed', 'Please contact support.');
        }
      }).catch((error: any) => {
        console.error('Checkout Error:', error);
      });

    } catch (error) {
      console.error('Subscription error', error);
      Alert.alert('Error', 'Failed to initialize subscription');
    } finally {
      setSubscribing(false);
    }
  };

  const pending = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const confirmed = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const revenue = bookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0);
  const trainerName = (user as any)?.fullName || 'Trainer';

  // Dummy analytics for the premium look
  const profileViews = Math.floor(Math.random() * 50) + 120;
  const retention = 85;

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9D00FF" />}>
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {trainerName} 👋</Text>
          <Text style={styles.subtitle}>Here's your dashboard overview</Text>
        </View>

        {/* The Premium Dashboard Content */}
        <View style={styles.premiumContent}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCard}>
              <Eye color="#9D00FF" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsVal}>{profileViews}</Text>
              <Text style={styles.analyticsLabel}>Profile Views</Text>
              <Text style={styles.analyticsTrend}>+12% this week</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Users color="#4CAF50" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsVal}>{retention}%</Text>
              <Text style={styles.analyticsLabel}>Client Retention</Text>
              <Text style={[styles.analyticsTrend, { color: '#4CAF50' }]}>Top 10%</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={[styles.statCard, { borderColor: '#FFC107' }]}>
              <Text style={styles.statValue}>{pending}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#2196F3' }]}>
              <Text style={styles.statValue}>{confirmed}</Text>
              <Text style={styles.statLabel}>Active Clients</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#9D00FF', width: '100%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.statValue}>₹{revenue}</Text>
                  <Text style={styles.statLabel}>Total Revenue</Text>
                </View>
                <TrendingUp color="#9D00FF" size={32} opacity={0.5} />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Calendar color="#fff" size={20} />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MessageSquare color="#fff" size={20} />
              <Text style={styles.actionText}>Broadcast</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* PAYWALL OVERLAY */}
      {!isSubscribed && (
        <View style={styles.paywallContainer}>
          <View style={styles.paywallOverlay} />
          <View style={styles.paywallContent}>
            <View style={styles.lockIconContainer}>
              <Lock color="#9D00FF" size={40} />
            </View>
            <Text style={styles.paywallTitle}>Unlock Your Profile</Text>
            <Text style={styles.paywallDesc}>
              Your profile is currently hidden from clients. Subscribe now to appear in search results, accept bookings, and unlock premium analytics.
            </Text>
            
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Visible to thousands of clients</Text>
              <Text style={styles.featureItem}>✓ Featured in category searches</Text>
              <Text style={styles.featureItem}>✓ Accept unlimited bookings</Text>
            </View>

            <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe} disabled={subscribing}>
              {subscribing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.subscribeText}>Subscribe for ₹499/month</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.cancelAnytime}>Cancel anytime</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 40 : 50, paddingBottom: 16 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#A1A1AA', marginTop: 6 },
  
  premiumContent: { paddingHorizontal: 20 },
  
  analyticsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  analyticsCard: { flex: 1, backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  analyticsVal: { color: '#fff', fontSize: 12, fontWeight: '700' },
  analyticsLabel: { color: '#A1A1AA', fontSize: 12, marginTop: 4 },
  analyticsTrend: { color: '#9D00FF', fontSize: 12, fontWeight: '600', marginTop: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%' as any, backgroundColor: '#0A0A0A', borderRadius: 16, padding: 18, borderLeftWidth: 3 },
  statValue: { fontSize: 12, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#A1A1AA', marginTop: 4 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 14 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#141414', padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Paywall
  paywallContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  paywallOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
  },
  paywallContent: {
    backgroundColor: '#1E1E1E',
    padding: 32,
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157,0,255,0.3)',
    shadowColor: '#9D00FF',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  lockIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(157,0,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  paywallTitle: { fontSize: 12, fontWeight: '800', color: '#fff', marginBottom: 12, textAlign: 'center' },
  paywallDesc: { fontSize: 12, color: '#A1A1AA', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  featuresList: { alignSelf: 'flex-start', marginBottom: 28, width: '100%' },
  featureItem: { color: '#E0E0E0', fontSize: 12, marginBottom: 10, fontWeight: '500' },
  subscribeBtn: { backgroundColor: '#9D00FF', width: '100%', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  subscribeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cancelAnytime: { color: '#666', fontSize: 12, marginTop: 16 }
});
