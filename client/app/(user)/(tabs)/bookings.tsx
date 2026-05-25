import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, Platform } from 'react-native';
import { bookingAPI } from '../../../services/endpoints';
import { Booking } from '../../../types';
import api from '../../../services/api';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState<{ visible: boolean; trainerId: string; bookingId: string }>({ visible: false, trainerId: '', bookingId: '' });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookingAPI.getUserBookings();
        setBookings(res.data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = bookings.filter((b) => {
    if (tab === 'upcoming') return ['pending', 'confirmed'].includes(b.bookingStatus);
    if (tab === 'completed') return b.bookingStatus === 'completed';
    return b.bookingStatus === 'cancelled';
  });

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post('/users/reviews', {
        trainerId: reviewModal.trainerId,
        bookingId: reviewModal.bookingId,
        rating,
        comment
      });
      Alert.alert('Success', 'Review submitted! Thank you for your feedback.');
      setReviewModal({ visible: false, trainerId: '', bookingId: '' });
      setComment('');
      setRating(5);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusColor: Record<string, string> = { pending: '#FFC107', confirmed: '#4CAF50', completed: '#2196F3', cancelled: '#F44336' };

  const renderItem = useCallback(({ item }: any) => {
    const trainer = item.trainerId as any;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.trainerName}>{trainer?.fullName || 'Trainer'}</Text>
          <Text style={[styles.status, { color: statusColor[item.bookingStatus] }]}>{item.bookingStatus}</Text>
        </View>
        <Text style={styles.detail}>📅 {new Date(item.bookingDate).toLocaleDateString()} • 🕐 {item.timeSlot}</Text>
        <Text style={styles.detail}>🏷️ {item.sessionType} • ₹{item.price}</Text>

        {item.bookingStatus === 'completed' && (
          <TouchableOpacity 
            style={styles.reviewBtn}
            onPress={() => setReviewModal({ visible: true, trainerId: trainer._id, bookingId: item._id })}
          >
            <Text style={styles.reviewBtnText}>⭐ Leave a Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [statusColor]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <View style={styles.tabs}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#B388FF" size="large" style={{ marginTop: 40 }} /> : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No {tab} bookings found.</Text>}
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
                  <Text style={[styles.star, { opacity: star <= rating ? 1 : 0.3 }]}>⭐</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review here..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setReviewModal({ visible: false, trainerId: '', bookingId: '' })}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={submitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', paddingTop: Platform.OS === 'web' ? 40 : 50 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', paddingHorizontal: 20, marginBottom: 16 },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: '#0A0A0A', marginRight: 8 },
  tabActive: { backgroundColor: '#B388FF' },
  tabText: { color: '#A1A1AA', fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20 },
  card: { backgroundColor: '#0A0A0A', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trainerName: { fontSize: 12, fontWeight: '600', color: '#fff' },
  status: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  detail: { fontSize: 12, color: '#A1A1AA', marginTop: 4 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 12 },
  
  reviewBtn: { marginTop: 16, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderWidth: 1, borderColor: '#FFC107', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  reviewBtnText: { color: '#FFC107', fontSize: 12, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#0A0A0A', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 12, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 12 },
  star: { fontSize: 38 },
  reviewInput: { backgroundColor: '#000000', color: '#fff', borderRadius: 12, padding: 16, height: 120, textAlignVertical: 'top', fontSize: 12, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2a2a2a', alignItems: 'center' },
  cancelBtnText: { color: '#A1A1AA', fontSize: 12, fontWeight: '600' },
  submitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#B388FF', alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
