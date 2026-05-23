import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { trainerAPI } from '../../../services/endpoints';
import { Trainer } from '../../../types';

const isWeb = Platform.OS === 'web';

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

  useEffect(() => {
    if (params.category !== undefined) {
      setCategory(params.category as string);
    }
  }, [params.category]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery('');
      };
    }, [])
  );

  useEffect(() => {
    trainerAPI.getCategories().then(res => {
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    }).catch(err => console.log('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch (err) {
        console.log('Location error', err);
      }
    })();
  }, []);

  const search = async () => {
    setLoading(true);
    try {
      const payload: any = { query, category, sort, limit: 50 };
      if (location) {
        payload.lat = location.lat;
        payload.lng = location.lng;
      }
      const res = await trainerAPI.getAll(payload);
      setTrainers(res.data.data || []);
    } catch { setTrainers([]); }
    setLoading(false);
  };

  useEffect(() => { search(); }, [category, sort, location]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      search();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = ['#4CAF50', '#E91E63', '#F44336', '#C9B07D', '#FF9800', '#2196F3', '#00BCD4', '#7C4DFF'];

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search trainers..." 
              placeholderTextColor="#666" 
              value={query} 
              onChangeText={setQuery} 
              onSubmitEditing={search} 
              returnKeyType="search" 
            />
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRowContainer}>
            <TouchableOpacity style={[styles.chip, !category && styles.chipActive]} onPress={() => setCategory('')}>
              <Text style={[styles.chipText, !category && styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map((c) => (
              <TouchableOpacity key={c.slug} style={[styles.chip, category === c.slug && styles.chipActive]} onPress={() => setCategory(c.slug === category ? '' : c.slug)}>
                <Text style={[styles.chipText, category === c.slug && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sortRow}>
            <Text style={styles.resultCount}>{trainers.length} trainers found</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRowContainer}>
              {[{ k: '', l: 'Relevance' }, { k: 'price_low', l: '₹ Low' }, { k: 'price_high', l: '₹ High' }, { k: 'experience', l: 'Experience' }].map((s) => (
                <TouchableOpacity key={s.k} style={[styles.sortChip, sort === s.k && styles.sortChipActive]} onPress={() => setSort(s.k)}>
                  <Text style={[styles.sortText, sort === s.k && styles.sortTextActive]}>{s.l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#C9B07D" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={trainers}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: item._id } })}>
                <View style={[styles.avatar, { backgroundColor: colors[item.fullName.length % colors.length] }]}>
                  {item.profilePhoto || (item as any).profileImage ? (
                    <Image source={{ uri: item.profilePhoto || (item as any).profileImage }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{initials(item.fullName)}</Text>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.meta}>{item.category?.replace('-', ' ')} • {item.experience}yr Exp</Text>
                  <View style={styles.row}>
                    <Text style={styles.rating}>⭐ {item.rating} <Text style={{ color: '#666', fontSize: 12 }}>({item.totalReviews || 0} reviews)</Text></Text>
                    <Text style={styles.price}>₹{item.pricing}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text style={styles.empty}>No trainers found. Try a different search.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414', alignItems: isWeb ? 'center' : 'stretch' },
  contentWrapper: { width: '100%', maxWidth: 1000, flex: 1 },
  
  header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 40 : 50, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 12 },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0A0A0A', 
    borderRadius: 16, 
    paddingHorizontal: 12,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  searchIcon: { fontSize: 12, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 12, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
    zIndex: 10,
  },
  catRowContainer: { paddingBottom: 8 },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16, 
    backgroundColor: '#0A0A0A', 
    marginRight: 6, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  chipActive: { backgroundColor: 'rgba(201,176,125,0.15)', borderColor: '#C9B07D' },
  chipText: { color: '#A1A1AA', fontSize: 12, textTransform: 'capitalize' },
  chipTextActive: { color: '#C9B07D', fontWeight: '600' },
  
  sortRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  sortRowContainer: { alignItems: 'center' },
  resultCount: { color: '#666', fontSize: 12, marginRight: 12 },
  sortChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    marginRight: 8, 
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  },
  sortChipActive: { backgroundColor: '#C9B07D', borderColor: '#C9B07D' },
  sortText: { color: '#A1A1AA', fontSize: 12 },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  
  list: { padding: 16, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#0A0A0A', 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  avatar: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 14 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  name: { fontSize: 12, fontWeight: '600', color: '#fff', marginBottom: 2 },
  meta: { fontSize: 11, color: '#A1A1AA', marginBottom: 6, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { color: '#FFC107', fontSize: 12, fontWeight: '500' },
  price: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },
  
  empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 12 },
});
