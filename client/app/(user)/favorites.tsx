import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heart, Star } from 'lucide-react-native';
import api from '../../services/api';
import { Trainer } from '../../types';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import SkeletonLoader from '../../components/SkeletonLoader';
import Button from '../../components/Button';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = async () => {
    try { const res = await api.get('/users/favorites'); setFavorites(res.data.data || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchFavorites(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchFavorites(); };

  const renderItem = useCallback(({ item, index }: { item: Trainer; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: item._id } })} style={styles.card}>
        <Avatar uri={item.profilePhoto || (item as any).profileImage} name={item.fullName} size="md" />
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.meta}>{item.category?.replace('-', ' ')} • {item.experience}yr Exp</Text>
          <View style={styles.row}>
            <View style={styles.ratingRow}>
              <Star size={13} color={theme.status.warning} fill={theme.status.warning} />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviews}>({item.totalReviews || 0})</Text>
            </View>
            <Text style={styles.price}>₹{item.pricing}/hr</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  ), [router]);

  return (
    <ScreenWrapper scroll={false}>
      <Header title="Favorites" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />
      {loading ? (
        <View style={styles.list}><SkeletonLoader variant="list-item" count={5} /></View>
      ) : (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Heart size={40} color={theme.text.muted} />}
              title="No favorites yet"
              subtitle="Trainers you favorite will appear here."
              actionLabel="Browse Trainers"
              onAction={() => router.push('/(user)/(tabs)/search')}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: spacing['5xl'] },
  card: { flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.lg },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  name: { ...typography.bodyMedium, color: theme.text.primary, marginBottom: spacing.xs },
  meta: { ...typography.bodySmall, color: theme.text.secondary, marginBottom: spacing.sm, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rating: { ...typography.bodySmall, color: theme.status.warning, fontWeight: '600' },
  reviews: { ...typography.caption, color: theme.text.muted },
  price: { ...typography.bodyMedium, color: theme.accent.purple, fontWeight: '600' },
});
