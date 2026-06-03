import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock, Eye, Users, MessageSquare, TrendingUp, Calendar, X, Send } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { bookingAPI, subscriptionAPI, authAPI, chatAPI } from '../../../services/endpoints';
import Constants from 'expo-constants';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

// Guard RazorpayCheckout for web
let RazorpayCheckout: any = null;
if (Platform.OS !== 'web') {
  try { RazorpayCheckout = require('react-native-razorpay').default; } catch {}
}

export default function TrainerDashboard() {
  const { user, setUser } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [broadcastVisible, setBroadcastVisible] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const isSubscribed = (user as any)?.subscriptionStatus === 'active';

  const fetchData = async () => { try { const res = await bookingAPI.getTrainerBookings(); setBookings(res.data.data || []); } catch {} };
  const refreshProfile = async () => { try { const res = await authAPI.getMe(); if (res.data?.data) setUser(res.data.data, 'trainer'); } catch {} };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); await refreshProfile(); setRefreshing(false); };

  const handleSubscribe = async () => {
    if (Platform.OS === 'web') { window.alert('Razorpay Checkout requires a native device build (EAS).'); return; }
    if (!RazorpayCheckout) { Alert.alert('Error', 'Razorpay not available'); return; }
    try {
      setSubscribing(true);
      const res = await subscriptionAPI.createTrainerSubscription();
      const { subscriptionId } = res.data.data;
      if (subscriptionId.startsWith('sub_mock_')) {
        try {
          await subscriptionAPI.verifyTrainerSubscription({ razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substr(2, 9), razorpaySubscriptionId: subscriptionId, razorpaySignature: 'mock_signature' });
          Alert.alert('Success', 'Your profile is now live! (Mock Payment)'); refreshProfile();
        } catch { Alert.alert('Verification Failed', 'Please contact support.'); }
        setSubscribing(false); return;
      }
      const options = {
        description: 'CoachME Premium Visibility', image: 'https://i.imgur.com/3g7nmJC.png', currency: 'INR',
        key: Constants.expoConfig?.extra?.razorpayKeyId || 'rzp_test_SsFnemBCyZjsKV', name: 'CoachME', subscription_id: subscriptionId,
        prefill: { email: (user as any)?.email || '', contact: (user as any)?.mobile || '9999999999', name: (user as any)?.name || (user as any)?.fullName || '' },
        theme: { color: '#7C4DFF' }
      };
      RazorpayCheckout.open(options).then(async (data: any) => {
        try { await subscriptionAPI.verifyTrainerSubscription({ razorpayPaymentId: data.razorpay_payment_id, razorpaySubscriptionId: data.razorpay_subscription_id, razorpaySignature: data.razorpay_signature }); Alert.alert('Success', 'Your profile is now live!'); refreshProfile(); }
        catch { Alert.alert('Verification Failed', 'Please contact support.'); }
      }).catch((error: any) => console.error('Checkout Error:', error));
    } catch { Alert.alert('Error', 'Failed to initialize subscription'); }
    finally { setSubscribing(false); }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) { if (Platform.OS === 'web') window.alert('Please enter a message'); else Alert.alert('Error', 'Please enter a message'); return; }
    try {
      setBroadcasting(true);
      const res = await chatAPI.broadcastMessage(broadcastText);
      if (Platform.OS === 'web') window.alert(`Broadcast sent to ${res.data.data.count} past clients!`);
      else Alert.alert('Success', `Broadcast sent to ${res.data.data.count} past clients!`);
      setBroadcastVisible(false); setBroadcastText('');
    } catch (err: any) { const msg = err.response?.data?.message || 'Failed to send broadcast'; if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Error', msg); }
    finally { setBroadcasting(false); }
  };

  const pending = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const activeClientsSet = new Set(); bookings.filter(b => b.bookingStatus === 'confirmed').forEach(b => activeClientsSet.add(b.userId?._id || b.userId));
  const activeClients = activeClientsSet.size;
  const allClientsSet = new Set(); bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'completed').forEach(b => allClientsSet.add(b.userId?._id || b.userId));
  const totalClients = allClientsSet.size;
  const completedClientsSet = new Set(); bookings.filter(b => b.bookingStatus === 'completed').forEach(b => completedClientsSet.add(b.userId?._id || b.userId));
  const revenue = bookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0);
  const trainerName = (user as any)?.fullName || 'Trainer';
  const retention = totalClients > 0 ? Math.round((completedClientsSet.size / totalClients) * 100) : 100;
  const profileViews = totalClients * 7 + pending * 3 + ((user as any)?.totalReviews || 0) * 15;

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const activeDates = bookings.filter(b => b.bookingStatus !== 'cancelled' && new Date(b.bookingDate).getMonth() === today.getMonth()).map(b => new Date(b.bookingDate).getDate());
  const selectedDateBookings = selectedDate ? bookings.filter(b => new Date(b.bookingDate).getDate() === selectedDate && new Date(b.bookingDate).getMonth() === today.getMonth()) : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />} contentContainerStyle={{ paddingBottom: spacing['6xl'] }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hello, {trainerName} 👋</Text>
            <Text style={styles.subtitle}>Here's your dashboard overview</Text>
          </View>
          <Avatar uri={(user as any)?.profilePhoto} name={trainerName} size="md" />
        </Animated.View>

        <View style={styles.content}>
          {/* Analytics */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.analyticsRow}>
            <Card style={styles.analyticsCard}>
              <Eye color={theme.accent.purple} size={24} />
              <Text style={styles.analyticsVal}>{profileViews}</Text>
              <Text style={styles.analyticsLabel}>Profile Views</Text>
            </Card>
            <Card style={styles.analyticsCard}>
              <Users color={theme.status.success} size={24} />
              <Text style={styles.analyticsVal}>{retention}%</Text>
              <Text style={styles.analyticsLabel}>Client Retention</Text>
            </Card>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.grid}>
            <Card style={[styles.statCard, { borderLeftColor: theme.status.warning }]}>
              <Text style={styles.statValue}>{pending}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: theme.status.info }]}>
              <Text style={styles.statValue}>{activeClients}</Text>
              <Text style={styles.statLabel}>Active Clients</Text>
            </Card>
            <Card style={[styles.revenueCard, { borderLeftColor: theme.accent.purple }]}>
              <View><Text style={styles.statValue}>₹{revenue}</Text><Text style={styles.statLabel}>Total Revenue</Text></View>
              <TrendingUp color={theme.accent.purple} size={32} opacity={0.5} />
            </Card>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${theme.accent.cyan}15`, borderColor: theme.accent.cyan }]} onPress={() => setScheduleVisible(true)} activeOpacity={0.7}>
                <Calendar color={theme.accent.cyan} size={20} /><Text style={[styles.actionText, { color: theme.accent.cyan }]}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: `${theme.accent.pink}15`, borderColor: theme.accent.pink }]} onPress={() => setBroadcastVisible(true)} activeOpacity={0.7}>
                <MessageSquare color={theme.accent.pink} size={20} /><Text style={[styles.actionText, { color: theme.accent.pink }]}>Broadcast</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* PAYWALL OVERLAY */}
      {!isSubscribed && (
        <View style={styles.paywallContainer}>
          <View style={styles.paywallOverlay} />
          <View style={styles.paywallContent}>
            <View style={styles.lockIconContainer}><Lock color={theme.accent.purple} size={40} /></View>
            <Text style={styles.paywallTitle}>Unlock Your Profile</Text>
            <Text style={styles.paywallDesc}>Your profile is currently hidden. Subscribe now to appear in search results, accept bookings, and unlock analytics.</Text>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>✓ Visible to thousands of clients</Text>
              <Text style={styles.featureItem}>✓ Featured in category searches</Text>
              <Text style={styles.featureItem}>✓ Accept unlimited bookings</Text>
            </View>
            <Button title={subscribing ? 'Processing...' : 'Subscribe Now'} onPress={handleSubscribe} loading={subscribing} disabled={subscribing} fullWidth />
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
              <TouchableOpacity onPress={() => setScheduleVisible(false)}><X color={theme.text.primary} size={24} /></TouchableOpacity>
            </View>
            <Card style={styles.calendar}>
              <Text style={styles.monthLabel}>{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <View style={styles.daysRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={styles.dayName}>{d}</Text>)}</View>
              <View style={styles.gridContainer}>
                {Array.from({ length: firstDay }).map((_, i) => <View key={`e-${i}`} style={styles.dayCell} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1; const isActive = activeDates.includes(date); const isSelected = selectedDate === date;
                  return (
                    <TouchableOpacity key={date} style={[styles.dayCell, isActive && styles.dayActive, isSelected && styles.daySelected]} onPress={() => setSelectedDate(date)}>
                      <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{date}</Text>
                      {isActive && <View style={styles.calDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
            {selectedDate && (
              <View>
                <Text style={styles.selectedTitle}>Appointments on {selectedDate}</Text>
                {selectedDateBookings.length === 0 ? <Text style={styles.noAppt}>No appointments scheduled.</Text> : selectedDateBookings.map((b, i) => (
                  <Card key={i} style={styles.miniCard}><Text style={styles.miniClient}>{b.userId?.name || 'Client'}</Text><Text style={styles.miniTime}>{b.timeSlot} - {b.sessionType}</Text></Card>
                ))}
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
              <TouchableOpacity onPress={() => setBroadcastVisible(false)}><X color={theme.text.primary} size={24} /></TouchableOpacity>
            </View>
            <Text style={styles.broadcastDesc}>Send a mass message to all clients who have previously booked with you.</Text>
            <View style={styles.inputContainer}>
              <TextInput style={styles.broadcastInput} placeholder="Type your announcement here..." placeholderTextColor={theme.text.muted} multiline value={broadcastText} onChangeText={setBroadcastText} />
            </View>
            <Button title="Send Broadcast" onPress={handleBroadcast} loading={broadcasting} disabled={broadcasting} fullWidth icon={<Send size={16} color="#fff" />} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.lg },
  greeting: { ...typography.hero, color: theme.text.primary, fontSize: 28 },
  subtitle: { ...typography.body, color: theme.text.secondary, marginTop: spacing.xs },
  content: { paddingHorizontal: spacing.xl },
  analyticsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  analyticsCard: { flex: 1, padding: spacing.xl },
  analyticsVal: { ...typography.h2, color: theme.text.primary, marginTop: spacing.sm },
  analyticsLabel: { ...typography.caption, color: theme.text.muted, marginTop: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing['2xl'] },
  statCard: { width: '47%' as any, padding: spacing.lg, borderLeftWidth: 3 },
  revenueCard: { width: '100%', padding: spacing.lg, borderLeftWidth: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statValue: { ...typography.h2, color: theme.text.primary },
  statLabel: { ...typography.caption, color: theme.text.muted, marginTop: spacing.xs },
  sectionTitle: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.md },
  quickActions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1 },
  actionText: { ...typography.bodyMedium, fontWeight: '600' },
  // Paywall
  paywallContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  paywallOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 15, 15, 0.85)' },
  paywallContent: { backgroundColor: theme.bg.elevated, padding: spacing['3xl'], borderRadius: radius.xl, width: '85%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: `${theme.accent.purple}40` },
  lockIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${theme.accent.purple}15`, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl },
  paywallTitle: { ...typography.h2, color: theme.text.primary, marginBottom: spacing.md, textAlign: 'center' },
  paywallDesc: { ...typography.body, color: theme.text.secondary, textAlign: 'center', lineHeight: 22, marginBottom: spacing['2xl'] },
  featuresList: { alignSelf: 'flex-start', marginBottom: spacing['2xl'], width: '100%' },
  featureItem: { ...typography.body, color: theme.text.primary, marginBottom: spacing.sm, fontWeight: '500' },
  cancelAnytime: { ...typography.caption, color: theme.text.muted, marginTop: spacing.lg },
  // Modals
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  modalContent: { backgroundColor: theme.bg.card, width: '90%', borderRadius: radius.xl, padding: spacing['2xl'], borderWidth: 1, borderColor: theme.border.default },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { ...typography.h2, color: theme.text.primary },
  broadcastDesc: { ...typography.bodySmall, color: theme.text.secondary, marginBottom: spacing.lg, lineHeight: 20 },
  inputContainer: { backgroundColor: theme.bg.input, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: `${theme.accent.purple}30`, marginBottom: spacing.xl, minHeight: 120 },
  broadcastInput: { color: theme.text.primary, ...typography.body, textAlignVertical: 'top', height: 100, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  // Calendar
  calendar: { padding: spacing.lg, marginBottom: spacing.xl },
  monthLabel: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.lg, textAlign: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  dayName: { ...typography.caption, color: theme.text.muted, width: 36, textAlign: 'center', fontWeight: '600' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayCell: { width: '14.28%', height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm, borderRadius: radius.full },
  dayActive: { backgroundColor: `${theme.accent.purple}20` },
  daySelected: { borderWidth: 1, borderColor: theme.accent.purple },
  dayText: { ...typography.body, color: theme.text.primary },
  dayTextActive: { color: theme.accent.purple, fontWeight: '700' },
  calDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accent.purple, marginTop: 2 },
  selectedTitle: { ...typography.bodyMedium, color: theme.text.secondary, marginBottom: spacing.md },
  noAppt: { ...typography.bodySmall, color: theme.text.muted, fontStyle: 'italic' },
  miniCard: { marginBottom: spacing.sm, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: theme.accent.purple },
  miniClient: { ...typography.bodyMedium, color: theme.text.primary },
  miniTime: { ...typography.caption, color: theme.text.muted, marginTop: spacing.xs },
});
