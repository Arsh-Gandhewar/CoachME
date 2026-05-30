import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Platform, RefreshControl } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { bookingAPI } from '../../../services/endpoints';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import Chip from '../../../components/Chip';
import EmptyState from '../../../components/EmptyState';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function TrainerBookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try { const res = await bookingAPI.getTrainerBookings(); setBookings(res.data.data || []); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const filtered = bookings.filter((b) => {
    if (tab === 'pending') return b.bookingStatus === 'pending';
    if (tab === 'upcoming') return b.bookingStatus === 'confirmed';
    return b.bookingStatus === 'completed' || b.bookingStatus === 'cancelled';
  });

  const updateStatus = async (id: string, status: string) => {
    const confirmMsg = status === 'confirmed' ? 'Confirm this booking?' : status === 'cancelled' ? 'Decline this booking?' : 'Mark as completed?';
    if (Platform.OS === 'web') {
      if (!window.confirm(confirmMsg)) return;
    }
    try {
      await bookingAPI.updateStatus(id, status);
      fetchBookings();
    } catch { Alert.alert('Error', 'Failed to update'); }
  };

  const renderItem = ({ item, index }: any) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card style={styles.card}>
        <Text style={styles.clientName}>{item.userId?.name || 'Client'}</Text>
        <View style={styles.metaRow}>
          <CalendarDays size={14} color={theme.text.muted} />
          <Text style={styles.meta}>{new Date(item.bookingDate).toLocaleDateString()} • {item.timeSlot}</Text>
        </View>
        <Text style={styles.metaSession}>{item.sessionType} • ₹{item.price}</Text>
        
        {item.bookingStatus === 'pending' && (
          <View style={styles.actions}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Button title="Confirm" size="sm" onPress={() => updateStatus(item._id, 'confirmed')} fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button title="Decline" variant="danger" size="sm" onPress={() => updateStatus(item._id, 'cancelled')} fullWidth />
            </View>
          </View>
        )}
        {item.bookingStatus === 'confirmed' && (
          <View style={styles.actions}>
            <Button title="Mark as Complete ✓" variant="secondary" size="sm" onPress={() => updateStatus(item._id, 'completed')} fullWidth />
          </View>
        )}
      </Card>
    </Animated.View>
  );

  return (
    <ScreenWrapper scroll={false}>
      <Text style={styles.title}>Bookings</Text>
      <View style={styles.tabs}>
        {['pending', 'upcoming', 'past'].map((t) => (
          <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} selected={tab === t} onPress={() => setTab(t)} size="sm" />
        ))}
      </View>

      {loading ? (
        <View style={{ padding: spacing.lg }}>
          <SkeletonLoader variant="card" count={3} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Clock size={40} color={theme.text.muted} />}
              title={`No ${tab} bookings`}
              subtitle={tab === 'pending' ? 'New booking requests will appear here' : ''}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: theme.text.primary, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  list: { paddingBottom: spacing['4xl'] },
  card: { marginBottom: spacing.md },
  clientName: { ...typography.bodyMedium, color: theme.text.primary, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  meta: { ...typography.bodySmall, color: theme.text.secondary },
  metaSession: { ...typography.bodySmall, color: theme.accent.purple, marginBottom: spacing.md },
  actions: { flexDirection: 'row', marginTop: spacing.sm },
});
