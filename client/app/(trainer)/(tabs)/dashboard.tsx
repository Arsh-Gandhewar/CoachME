import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { bookingAPI } from '../../../services/endpoints';

export default function TrainerDashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await bookingAPI.getTrainerBookings();
      setBookings(res.data.data || []);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const pending = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const confirmed = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const completed = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const revenue = bookings.filter((b) => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.price, 0);

  const trainerName = (user as any)?.fullName || 'Trainer';

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {trainerName} 👋</Text>
        <Text style={styles.subtitle}>Here's your dashboard</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.statCard, { borderColor: '#FFC107' }]}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#4CAF50' }]}>
          <Text style={styles.statValue}>{confirmed}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#2196F3' }]}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#FF5722' }]}>
          <Text style={styles.statValue}>₹{revenue}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Bookings</Text>
        {bookings.slice(0, 5).map((b) => (
          <View key={b._id} style={styles.bookingItem}>
            <Text style={styles.bookingUser}>{b.userId?.name || 'Client'}</Text>
            <Text style={styles.bookingMeta}>{new Date(b.bookingDate).toLocaleDateString()} • {b.timeSlot} • {b.sessionType}</Text>
            <Text style={[styles.bookingStatus, { color: b.bookingStatus === 'confirmed' ? '#4CAF50' : b.bookingStatus === 'pending' ? '#FFC107' : '#9E9E9E' }]}>{b.bookingStatus}</Text>
          </View>
        ))}
        {bookings.length === 0 && <Text style={styles.empty}>No bookings yet</Text>}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 14, color: '#9E9E9E', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginTop: 12 },
  statCard: { width: '47%' as any, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, borderLeftWidth: 3 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 13, color: '#9E9E9E', marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 14 },
  bookingItem: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  bookingUser: { color: '#fff', fontSize: 15, fontWeight: '600' },
  bookingMeta: { color: '#9E9E9E', fontSize: 13, marginTop: 4 },
  bookingStatus: { fontSize: 12, fontWeight: '600', marginTop: 6, textTransform: 'capitalize' },
  empty: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 20 },
});
