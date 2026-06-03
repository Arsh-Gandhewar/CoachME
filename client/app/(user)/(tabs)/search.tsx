import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, StyleSheet, Platform, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Location from 'expo-location';
import { Search as SearchIcon, Star, MapPin } from 'lucide-react-native';
import { trainerAPI } from '../../../services/endpoints';
import { Trainer } from '../../../types';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import EmptyState from '../../../components/EmptyState';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(params.category as string || '');
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { if (params.category !== undefined) setCategory(params.category as string); }, [params.category]);
  useFocusEffect(useCallback(() => { return () => setQuery(''); }, []));

  useEffect(() => {
    trainerAPI.getCategories().then(res => { if (res.data?.data) setCategories(res.data.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try { let loc = await Location.getCurrentPositionAsync({}); setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude }); }
      catch (err) { console.error('Location error', err); }
    })();
  }, []);

  const search = async () => {
    setLoading(true);
    try {
      const payload: any = { query, category, sort, limit: 50 };
      if (location) { payload.lat = location.lat; payload.lng = location.lng; }
      const res = await trainerAPI.getAll(payload);
      setTrainers(res.data.data || []);
    } catch { setTrainers([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { search(); }, [category, sort, location]);
  useEffect(() => { const t = setTimeout(search, 400); return () => clearTimeout(t); }, [query]);
  const onRefresh = () => { setRefreshing(true); search(); };

  const renderItem = useCallback(({ item, index }: { item: Trainer; index: number }) => (
    <Animated.View entering={FadeInDown.duration(250).delay(index * 40)}>
      <Card onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: item._id } })} style={styles.trainerCard}>
        <Avatar uri={item.profilePhoto || (item as any).profileImage} name={item.fullName} size="md" />
        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>
          <Text style={styles.meta}>{item.category?.replace('-', ' ')} • {item.experience}yr Exp</Text>
          <View style={styles.row}>
            <View style={styles.ratingRow}>
              <Star size={13} color={theme.status.warning} fill={theme.status.warning} />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.totalReviews || 0})</Text>
            </View>
            <Text style={styles.price}>₹{item.pricing}/hr</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  ), [router]);

  return (
    <ScreenWrapper scroll={false}>
      <Text style={styles.title}>Explore</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <SearchIcon size={18} color={theme.text.muted} />
        <TextInput style={styles.searchInput} placeholder="Search trainers..." placeholderTextColor={theme.text.muted} value={query} onChangeText={setQuery} onSubmitEditing={search} returnKeyType="search" />
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        <Chip label="All" selected={!category} onPress={() => setCategory('')} size="sm" />
        {categories.map((c) => (
          <View key={c.slug} style={{ marginLeft: spacing.sm }}>
            <Chip label={c.name} selected={category === c.slug} onPress={() => setCategory(c.slug === category ? '' : c.slug)} size="sm" />
          </View>
        ))}
      </ScrollView>

      {/* Sort & Count */}
      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{trainers.length} trainers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, minHeight: 40 }} contentContainerStyle={{ alignItems: 'center' }}>
          {[{ k: '', l: 'Relevance' }, { k: 'price_low', l: '₹ Low' }, { k: 'price_high', l: '₹ High' }, { k: 'experience', l: 'Experience' }].map((s) => (
            <View key={s.k} style={{ marginLeft: spacing.xs }}>
              <Chip label={s.l} selected={sort === s.k} onPress={() => setSort(s.k)} size="sm" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      {loading && trainers.length === 0 ? (
        <View style={{ padding: spacing.lg }}><SkeletonLoader variant="list-item" count={5} /></View>
      ) : (
        <FlatList
          data={trainers} renderItem={renderItem} keyExtractor={(item) => item._id}
          initialNumToRender={10} maxToRenderPerBatch={10} windowSize={5} removeClippedSubviews={true}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />}
          ListEmptyComponent={<EmptyState icon={<SearchIcon size={40} color={theme.text.muted} />} title="No trainers found" subtitle="Try a different search or category" />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: theme.text.primary, marginBottom: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg.card, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: theme.border.subtle, marginBottom: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.md, color: theme.text.primary, ...typography.body, marginLeft: spacing.sm, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  catScroll: { flexGrow: 0, minHeight: 40, marginBottom: spacing.sm },
  catContent: { paddingBottom: spacing.xs },
  sortRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  resultCount: { ...typography.caption, color: theme.text.muted, marginRight: spacing.md },
  list: { paddingBottom: spacing['5xl'] },
  trainerCard: { flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.md },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  name: { ...typography.bodyMedium, color: theme.text.primary, marginBottom: spacing.xs },
  meta: { ...typography.caption, color: theme.text.secondary, marginBottom: spacing.sm, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  ratingText: { ...typography.bodySmall, color: theme.status.warning, fontWeight: '600' },
  reviewCount: { ...typography.caption, color: theme.text.muted },
  price: { ...typography.bodyMedium, color: theme.accent.purple, fontWeight: '600' },
});
