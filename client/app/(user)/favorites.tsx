import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Trainer } from '../../types';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      setFavorites(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const initials = (name: string) => name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = ['#4CAF50', '#E91E63', '#F44336', '#FF5722', '#FF9800', '#2196F3', '#00BCD4', '#7C4DFF'];

  const renderItem = ({ item }: { item: Trainer }) => (
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#FF5722" />
          </View>
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.icon}>❤️</Text>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyDesc}>Trainers you favorite will appear here.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(user)/(tabs)/search')}>
              <Text style={styles.browseText}>Browse Trainers</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  content: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { color: '#9E9E9E', fontSize: 15, marginBottom: 24 },
  
  browseBtn: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#FF5722', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  browseText: { color: '#FF5722', fontSize: 16, fontWeight: '600' },

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
});
