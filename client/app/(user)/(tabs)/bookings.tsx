import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Platform, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CalendarDays, Clock, Star, XCircle } from 'lucide-react-native';
import { bookingAPI } from '../../../services/endpoints';
import { Booking } from '../../../types';
import api from '../../../services/api';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import EmptyState from '../../../components/EmptyState';
import SkeletonLoader from '../../../components/SkeletonLoader';
import Button from '../../../components/Button';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{ visible: boolean; trainerId: string; bookingId: string }>({ visible: false, trainerId: '', bookingId: '' });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const canCancel = (booking: Booking) => {
    if (!['pending', 'confirmed'].includes(booking.bookingStatus)) return false;
    const [hours, minutes] = booking.timeSlot.split(':').map(Number);
    const sessionTime = new Date(booking.bookingDate);
    sessionTime.setHours(hours, minutes, 0, 0);
    const hoursUntil = (sessionTime.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  };

  const handleCancel = (bookingId: string) => {
    const doCancel = async () => {
      setCancelling(bookingId);
      try {
        await bookingAPI.cancel(bookingId);
        if (Platform.OS === 'web') window.alert('Booking cancelled successfully');
        else Alert.alert('Success', 'Booking cancelled successfully');
        fetchBookings();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to cancel booking';
        if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Error', msg);
      } finally { setCancelling(null); }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this booking?')) doCancel();
    } else {
      Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  const fetchBookings = async () => {
    try { const res = await bookingAPI.getUserBookings(); setBookings(res.data.data || []); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchBookings(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const filtered = bookings.filter((b) => {
    if (tab === 'upcoming') return ['pending', 'confirmed'].includes(b.bookingStatus);
    if (tab === 'completed') return b.bookingStatus === 'completed';
    return b.bookingStatus === 'cancelled';
  });

  const submitReview = async () => {
    if (!comment.trim()) {
      if (Platform.OS === 'web') window.alert('Please enter a review comment');
      else Alert.alert('Error', 'Please enter a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/users/reviews', { trainerId: reviewModal.trainerId, bookingId: reviewModal.bookingId, rating, comment });
      if (Platform.OS === 'web') window.alert('Review submitted! Thank you for your feedback.');
      else Alert.alert('Success', 'Review submitted! Thank you for your feedback.');
      setReviewModal({ visible: false, trainerId: '', bookingId: '' });
      setComment(''); setRating(5);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Error', msg);
    } finally { setSubmittingReview(false); }
  };

  const statusColor: Record<string, string> = { pending: theme.status.warning, confirmed: theme.status.success, completed: theme.status.info, cancelled: theme.status.error };

  const renderItem = useCallback(({ item, index }: any) => {
    const trainer = item.trainerId as any;
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.trainerName}>{trainer?.fullName || 'Trainer'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor[item.bookingStatus]}20` }]}>
              <Text style={[styles.statusText, { color: statusColor[item.bookingStatus] }]}>{item.bookingStatus}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <CalendarDays size={14} color={theme.text.muted} />
            <Text style={styles.detail}>{new Date(item.bookingDate).toLocaleDateString()} • {item.timeSlot}</Text>
          </View>
          <View style={styles.metaRow}>
            <Clock size={14} color={theme.text.muted} />
            <Text style={styles.detail}>{item.sessionType} • <Text style={{ color: theme.accent.purple, fontWeight: '600' }}>₹{item.price}</Text></Text>
          </View>

          {item.bookingStatus === 'completed' && (
            <TouchableOpacity style={styles.reviewBtn} onPress={() => setReviewModal({ visible: true, trainerId: trainer._id, bookingId: item._id })}>
              <Star size={14} color={theme.status.warning} fill={theme.status.warning} />
              <Text style={styles.reviewBtnText}>Leave a Review</Text>
            </TouchableOpacity>
          )}

          {['pending', 'confirmed'].includes(item.bookingStatus) && (
            canCancel(item) ? (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item._id)}
                disabled={cancelling === item._id}
              >
                <XCircle size={14} color={theme.status.error} />
                <Text style={styles.cancelBtnText}>
                  {cancelling === item._id ? 'Cancelling...' : 'Cancel Booking'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.cancelDisabled}>
                <XCircle size={14} color={theme.text.muted} />
                <Text style={styles.cancelDisabledText}>Cannot cancel within 24hrs</Text>
              </View>
            )
          )}
        </Card>
      </Animated.View>
    );
  }, [cancelling]);

  return (
    <ScreenWrapper scroll={false}>
      <Text style={styles.title}>My Bookings</Text>
      <View style={styles.tabs}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
          <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} selected={tab === t} onPress={() => setTab(t)} size="sm" />
        ))}
      </View>

      {loading ? (
        <View style={{ padding: spacing.lg }}><SkeletonLoader variant="card" count={3} /></View>
      ) : (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={filtered} renderItem={renderItem} keyExtractor={(item) => item._id}
          initialNumToRender={10} maxToRenderPerBatch={10} windowSize={5} removeClippedSubviews={true}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />}
          ListEmptyComponent={<EmptyState icon={<CalendarDays size={40} color={theme.text.muted} />} title={`No ${tab} bookings`} subtitle="Your bookings will appear here" />}
        />
      )}

      {/* Review Modal */}
      <Modal visible={reviewModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Trainer</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star size={36} color={theme.status.warning} fill={star <= rating ? theme.status.warning : 'transparent'} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.reviewInput} placeholder="Write your review here..." placeholderTextColor={theme.text.muted} multiline numberOfLines={4} value={comment} onChangeText={setComment} />
            <View style={styles.modalActions}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Button title="Cancel" variant="ghost" onPress={() => setReviewModal({ visible: false, trainerId: '', bookingId: '' })} fullWidth />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Submit" onPress={submitReview} loading={submittingReview} disabled={submittingReview} fullWidth />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: theme.text.primary, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  list: { paddingBottom: spacing['4xl'] },
  card: { marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  trainerName: { ...typography.bodyMedium, color: theme.text.primary },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
  statusText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  detail: { ...typography.bodySmall, color: theme.text.secondary },
  reviewBtn: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: `${theme.status.warning}15`, borderWidth: 1, borderColor: theme.status.warning, paddingVertical: spacing.sm, borderRadius: radius.md },
  reviewBtnText: { ...typography.bodySmall, color: theme.status.warning, fontWeight: '600' },
  cancelBtn: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: `${theme.status.error}15`, borderWidth: 1, borderColor: theme.status.error, paddingVertical: spacing.sm, borderRadius: radius.md },
  cancelBtnText: { ...typography.bodySmall, color: theme.status.error, fontWeight: '600' },
  cancelDisabled: { marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: `${theme.text.muted}10`, paddingVertical: spacing.sm, borderRadius: radius.md, opacity: 0.6 },
  cancelDisabledText: { ...typography.caption, color: theme.text.muted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: theme.bg.card, borderRadius: radius.xl, padding: spacing['2xl'] },
  modalTitle: { ...typography.h2, color: theme.text.primary, textAlign: 'center', marginBottom: spacing.xl },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing['2xl'], gap: spacing.md },
  reviewInput: { backgroundColor: theme.bg.primary, color: theme.text.primary, borderRadius: radius.md, padding: spacing.lg, height: 120, textAlignVertical: 'top', ...typography.body, marginBottom: spacing['2xl'], borderWidth: 1, borderColor: theme.border.subtle },
  modalActions: { flexDirection: 'row' },
});
