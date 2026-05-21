import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = ['#4CAF50', '#E91E63', '#F44336', '#FF5722', '#FF9800', '#2196F3', '#00BCD4', '#7C4DFF'];

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
          <ActivityIndicator size="large" color="#FF5722" style={{ marginTop: 40 }} />
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
                    <Text style={styles.rating}>⭐ {item.rating} <Text style={{ color: '#666', fontSize: 11 }}>({item.totalReviews || 0} reviews)</Text></Text>
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
  
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 20 },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1a1a1a', 
    borderRadius: 16, 
    paddingHorizontal: 16,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)' 
  },
  searchIcon: { fontSize: 16, marginRight: 12 },
  searchInput: { flex: 1, paddingVertical: 16, color: '#fff', fontSize: 16, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
    zIndex: 10,
  },
  catRowContainer: { paddingBottom: 8 },
  chip: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#1a1a1a', 
    marginRight: 8, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)' 
  },
  chipActive: { backgroundColor: 'rgba(255,87,34,0.15)', borderColor: '#FF5722' },
  chipText: { color: '#9E9E9E', fontSize: 13, textTransform: 'capitalize' },
  chipTextActive: { color: '#FF5722', fontWeight: '600' },
  
  sortRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  sortRowContainer: { alignItems: 'center' },
  resultCount: { color: '#666', fontSize: 12, marginRight: 16 },
  sortChip: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    marginRight: 8, 
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  },
  sortChipActive: { backgroundColor: '#FF5722', borderColor: '#FF5722' },
  sortText: { color: '#9E9E9E', fontSize: 11 },
  sortTextActive: { color: '#fff', fontWeight: '600' },
  
  list: { padding: 20, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#1a1a1a', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)' 
  },
  avatar: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 14 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  meta: { fontSize: 13, color: '#9E9E9E', marginBottom: 8, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { color: '#FFC107', fontSize: 13, fontWeight: '500' },
  price: { color: '#FF5722', fontSize: 15, fontWeight: '600' },
  
  empty: { color: '#666', textAlign: 'center', marginTop: 40, fontSize: 15 },
});
