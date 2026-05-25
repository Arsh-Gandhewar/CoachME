import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { bookingAPI } from '../../../services/endpoints';

export default function TrainerBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');

  const fetchBookings = async () => {
    try { const res = await bookingAPI.getTrainerBookings(); setBookings(res.data.data || []); } catch {}
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = bookings.filter((b) => {
    if (tab === 'pending') return b.bookingStatus === 'pending';
    if (tab === 'upcoming') return b.bookingStatus === 'confirmed';
    return b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled';
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await bookingAPI.updateStatus(id, status);
      fetchBookings();
    } catch { Alert.alert('Error', 'Failed to update'); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookings</Text>
      <View style={styles.tabs}>
        {['pending', 'upcoming', 'past'].map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.clientName}>{item.userId?.name || 'Client'}</Text>
            <Text style={styles.meta}>📅 {new Date(item.bookingDate).toLocaleDateString()} • {item.timeSlot}</Text>
            <Text style={styles.meta}>🏷️ {item.sessionType} • ₹{item.price}</Text>
            {item.bookingStatus === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => updateStatus(item._id, 'confirmed')}>
                  <Text style={styles.confirmText}>Confirm ✓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => updateStatus(item._id, 'cancelled')}>
                  <Text style={styles.cancelText}>Decline ✗</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No {tab} bookings</Text>}
      />
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
  clientName: { fontSize: 12, fontWeight: '600', color: '#fff' },
  meta: { fontSize: 12, color: '#A1A1AA', marginTop: 4 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  confirmBtn: { flex: 1, backgroundColor: 'rgba(76,175,80,0.15)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
  confirmText: { color: '#4CAF50', fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F44336' },
  cancelText: { color: '#F44336', fontWeight: '600' },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 12 },
});
