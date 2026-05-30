import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Platform, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CalendarDays, Clock, Star } from 'lucide-react-native';
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
        </Card>
      </Animated.View>
    );
  }, []);

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
        <FlatList
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: theme.bg.card, borderRadius: radius.xl, padding: spacing['2xl'] },
  modalTitle: { ...typography.h2, color: theme.text.primary, textAlign: 'center', marginBottom: spacing.xl },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing['2xl'], gap: spacing.md },
  reviewInput: { backgroundColor: theme.bg.primary, color: theme.text.primary, borderRadius: radius.md, padding: spacing.lg, height: 120, textAlignVertical: 'top', ...typography.body, marginBottom: spacing['2xl'], borderWidth: 1, borderColor: theme.border.subtle },
  modalActions: { flexDirection: 'row' },
});
