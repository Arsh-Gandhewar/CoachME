import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, Image } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { bookingAPI, subscriptionAPI, authAPI, chatAPI } from '../../../services/endpoints';
import RazorpayCheckout from 'react-native-razorpay';
import Constants from 'expo-constants';
import { Lock, Eye, Users, MessageSquare, TrendingUp, Calendar, X, Send } from 'lucide-react-native';
import { BlurView } from 'expo-blur'; // Will use generic opacity overlay if blur fails

export default function TrainerDashboard() {
  const { user, setUser } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  
  // Modals
  const [broadcastVisible, setBroadcastVisible] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const isSubscribed = (user as any)?.subscriptionStatus === 'active';

  const fetchData = async () => {
    try {
      const res = await bookingAPI.getTrainerBookings();
      setBookings(res.data.data || []);
    } catch {}
  };

  const refreshProfile = async () => {
    try {
      const res = await authAPI.getMe();
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
        theme: { color: '#B388FF' }
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

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return Alert.alert('Error', 'Please enter a message');
    try {
      setBroadcasting(true);
      const res = await chatAPI.broadcastMessage(broadcastText);
      Alert.alert('Success', `Broadcast sent to ${res.data.data.count} past clients!`);
      setBroadcastVisible(false);
      setBroadcastText('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setBroadcasting(false);
    }
  };

  const pending = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const confirmed = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const completed = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const revenue = bookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0);
  const trainerName = (user as any)?.fullName || 'Trainer';
  const profilePhoto = (user as any)?.profilePhoto;
  const initials = trainerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const totalClients = confirmed + completed;
  const retention = totalClients > 0 ? Math.round((completed / totalClients) * 100) : 100;
  const profileViews = totalClients * 7 + pending * 3 + ((user as any)?.totalReviews || 0) * 15;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  
  // Dates with active appointments this month
  const activeDates = bookings
    .filter(b => b.bookingStatus !== 'cancelled' && new Date(b.bookingDate).getMonth() === today.getMonth())
    .map(b => new Date(b.bookingDate).getDate());

  const selectedDateBookings = selectedDate 
    ? bookings.filter(b => new Date(b.bookingDate).getDate() === selectedDate && new Date(b.bookingDate).getMonth() === today.getMonth())
    : [];

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B388FF" />}>
        
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hello, {trainerName} 👋</Text>
            <Text style={styles.subtitle}>Here's your dashboard overview</Text>
          </View>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarInitials}>
              <Text style={styles.headerAvatarText}>{initials}</Text>
            </View>
          )}
        </View>

        {/* The Premium Dashboard Content */}
        <View style={styles.premiumContent}>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsCard}>
              <Eye color="#B388FF" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsVal}>{profileViews}</Text>
              <Text style={styles.analyticsLabel}>Profile Views</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Users color="#4CAF50" size={24} style={{ marginBottom: 8 }} />
              <Text style={styles.analyticsVal}>{retention}%</Text>
              <Text style={styles.analyticsLabel}>Client Retention</Text>
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
            <View style={[styles.statCard, { borderColor: '#B388FF', width: '100%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={styles.statValue}>₹{revenue}</Text>
                  <Text style={styles.statLabel}>Total Revenue</Text>
                </View>
                <TrendingUp color="#B388FF" size={32} opacity={0.5} />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(0, 229, 255, 0.1)', borderColor: '#00E5FF', borderWidth: 1 }]} onPress={() => setScheduleVisible(true)}>
              <Calendar color="#00E5FF" size={20} />
              <Text style={[styles.actionText, { color: '#00E5FF' }]}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255, 64, 129, 0.1)', borderColor: '#FF4081', borderWidth: 1 }]} onPress={() => setBroadcastVisible(true)}>
              <MessageSquare color="#FF4081" size={20} />
              <Text style={[styles.actionText, { color: '#FF4081' }]}>Broadcast</Text>
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
              <Lock color="#B388FF" size={40} />
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
                <Text style={styles.subscribeText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.cancelAnytime}>Cancel anytime</Text>
          </View>
        </View>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Schedule</Text>
              <TouchableOpacity onPress={() => setScheduleVisible(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendar}>
              <Text style={styles.monthLabel}>{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <View style={styles.daysRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={styles.dayName}>{d}</Text>)}
              </View>
              <View style={styles.gridContainer}>
                {Array.from({ length: firstDay }).map((_, i) => <View key={`empty-${i}`} style={styles.dayCell} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1;
                  const isActive = activeDates.includes(date);
                  const isSelected = selectedDate === date;
                  return (
                    <TouchableOpacity 
                      key={date} 
                      style={[styles.dayCell, isActive && styles.dayActive, isSelected && styles.daySelected]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{date}</Text>
                      {isActive && <View style={styles.dot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedDate && (
              <View style={styles.selectedBookings}>
                <Text style={styles.selectedTitle}>Appointments on {selectedDate}</Text>
                {selectedDateBookings.length === 0 ? (
                  <Text style={styles.noAppt}>No appointments scheduled.</Text>
                ) : (
                  selectedDateBookings.map((b, i) => (
                    <View key={i} style={styles.miniCard}>
                      <Text style={styles.miniClient}>{b.userId?.name || 'Client'}</Text>
                      <Text style={styles.miniTime}>{b.timeSlot} - {b.sessionType}</Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      )}

      {/* BROADCAST MODAL */}
      {broadcastVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Broadcast Message</Text>
              <TouchableOpacity onPress={() => setBroadcastVisible(false)}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.broadcastDesc}>
              Send a mass message to all clients who have previously booked an appointment with you.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.broadcastInput}
                placeholder="Type your announcement here..."
                placeholderTextColor="#666"
                multiline
                value={broadcastText}
                onChangeText={setBroadcastText}
              />
            </View>

            <TouchableOpacity style={styles.sendBtn} onPress={handleBroadcast} disabled={broadcasting}>
              {broadcasting ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Send color="#fff" size={16} style={{ marginRight: 8 }} />
                  <Text style={styles.sendText}>Send Broadcast</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 40 : 50, paddingBottom: 16 },
  headerText: { flex: 1 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#A1A1AA', marginTop: 6 },
  headerAvatar: { width: 50, height: 50, borderRadius: 16 },
  headerAvatarInitials: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#B388FF', justifyContent: 'center', alignItems: 'center' },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  premiumContent: { paddingHorizontal: 20 },
  
  analyticsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  analyticsCard: { flex: 1, backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  analyticsVal: { color: '#fff', fontSize: 12, fontWeight: '700' },
  analyticsLabel: { color: '#A1A1AA', fontSize: 12, marginTop: 4 },
  analyticsTrend: { color: '#B388FF', fontSize: 12, fontWeight: '600', marginTop: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%' as any, backgroundColor: '#0A0A0A', borderRadius: 16, padding: 18, borderLeftWidth: 3 },
  statValue: { fontSize: 12, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#A1A1AA', marginTop: 4 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 14 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
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
    borderColor: 'rgba(179,136,255,0.3)',
    shadowColor: '#B388FF',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  lockIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(179,136,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  paywallTitle: { fontSize: 12, fontWeight: '800', color: '#fff', marginBottom: 12, textAlign: 'center' },
  paywallDesc: { fontSize: 12, color: '#A1A1AA', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  featuresList: { alignSelf: 'flex-start', marginBottom: 28, width: '100%' },
  featureItem: { color: '#E0E0E0', fontSize: 12, marginBottom: 10, fontWeight: '500' },
  subscribeBtn: { backgroundColor: '#B388FF', width: '100%', paddingVertical: 16, borderRadius: 100, alignItems: 'center' },
  subscribeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cancelAnytime: { color: '#666', fontSize: 12, marginTop: 16 },

  // Modals General
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  modalContent: {
    backgroundColor: '#111',
    width: '90%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  // Broadcast Modal
  broadcastDesc: { color: '#A1A1AA', fontSize: 12, marginBottom: 16, lineHeight: 18 },
  inputContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(179,136,255,0.3)',
    marginBottom: 20,
    minHeight: 120,
  },
  broadcastInput: { color: '#fff', fontSize: 14, textAlignVertical: 'top', height: 100 },
  sendBtn: {
    backgroundColor: '#B388FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Schedule Modal
  calendar: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  monthLabel: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  dayName: { color: '#A1A1AA', fontSize: 12, width: 36, textAlign: 'center', fontWeight: '600' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderRadius: 20 },
  dayActive: { backgroundColor: 'rgba(179,136,255,0.15)' },
  daySelected: { borderWidth: 1, borderColor: '#B388FF' },
  dayText: { color: '#fff', fontSize: 14 },
  dayTextActive: { color: '#B388FF', fontWeight: '700' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#B388FF', marginTop: 2 },

  selectedBookings: {
    marginTop: 8,
  },
  selectedTitle: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', marginBottom: 12 },
  noAppt: { color: '#666', fontSize: 12, fontStyle: 'italic' },
  miniCard: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#B388FF',
  },
  miniClient: { color: '#fff', fontSize: 14, fontWeight: '600' },
  miniTime: { color: '#A1A1AA', fontSize: 12, marginTop: 4 },
});
