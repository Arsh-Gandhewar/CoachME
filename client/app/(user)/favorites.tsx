import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Trainer } from '../../types';
import { Avatar } from '../../components/Avatar';

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
  const colors = ['#4CAF50', '#E91E63', '#F44336', '#C9B07D', '#FF9800', '#2196F3', '#00BCD4', '#7C4DFF'];

  const renderItem = useCallback(({ item }: { item: Trainer }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: item._id } })}>
      <Avatar 
        uri={item.profilePhoto || (item as any).profileImage} 
        style={styles.avatarImage}
        containerStyle={[styles.avatar, { backgroundColor: colors[item.fullName.length % colors.length] }]}
        fallbackText={initials(item.fullName)}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.meta}>{item.category?.replace('-', ' ')} • {item.experience}yr Exp</Text>
        <View style={styles.row}>
          <Text style={styles.rating}>⭐ {item.rating} <Text style={{ color: '#666', fontSize: 12 }}>({item.totalReviews || 0} reviews)</Text></Text>
          <Text style={styles.price}>₹{item.pricing}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [router]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#C9B07D" />
          </View>
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
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
  backText: { color: '#A1A1AA', fontSize: 12 },
  title: { color: '#fff', fontSize: 12, fontWeight: '700' },
  
  content: { flex: 1 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  icon: { fontSize: 66, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { color: '#A1A1AA', fontSize: 12, marginBottom: 24 },
  
  browseBtn: { backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: '#C9B07D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  browseText: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },

  list: { padding: 20, paddingBottom: 100 },
  card: { 
    flexDirection: 'row', 
    backgroundColor: '#0A0A0A', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.04)' 
  },
  avatar: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 14 },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  info: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  name: { fontSize: 12, fontWeight: '600', color: '#fff', marginBottom: 4 },
  meta: { fontSize: 12, color: '#A1A1AA', marginBottom: 8, textTransform: 'capitalize' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { color: '#FFC107', fontSize: 12, fontWeight: '500' },
  price: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },
});
