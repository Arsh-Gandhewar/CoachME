import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trainerAPI } from '../../../services/endpoints';
import { Trainer, Review } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';

export default function TrainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, setUser, role } = useAuthStore();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  
  // Derive isFavorite directly from global state so it persists if component is kept alive in stack
  const favs = (user as any)?.favorites || [];
  const isFavorite = favs.includes(id) || favs.some((f: any) => f?._id === id || f === id);

  useEffect(() => {
    (async () => {
      try {
        const [tRes, rRes] = await Promise.all([trainerAPI.getById(id!), trainerAPI.getReviews(id!)]);
        setTrainer(tRes.data.data);
        setReviews(rRes.data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const toggleFavorite = async () => {
    // Optimistic UI update on the global store
    const newFavs = isFavorite 
      ? favs.filter((f: any) => f !== id && f?._id !== id)
      : [...favs, id];
      
    setUser({ ...user, favorites: newFavs }, role || 'user');

    try {
      const res = await api.post(`/users/favorites/${id}`);
      // Final update from server
      setUser({ ...user, favorites: res.data.data.favorites }, role || 'user');
    } catch (err) {
      // Revert if failed
      setUser({ ...user, favorites: favs }, role || 'user');
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#FF5722" /></View>;
  if (!trainer) return <View style={styles.loading}><Text style={styles.errorText}>Trainer not found</Text></View>;

  const initials = trainer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const colors = ['#FF5722', '#7C4DFF', '#00BCD4', '#4CAF50', '#E91E63'];
  const bgColor = colors[trainer.fullName.length % colors.length];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={[styles.hero, { backgroundColor: bgColor + '20' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/home')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite}>
            <Text style={styles.favIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <View style={[styles.avatarLarge, { backgroundColor: bgColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{trainer.fullName}</Text>
          <View style={styles.badges}>
            {trainer.verified && <View style={styles.badge}><Text style={styles.badgeText}>✓ Verified</Text></View>}
            {trainer.premium && <View style={[styles.badge, styles.premiumBadge]}><Text style={[styles.badgeText, { color: '#FFC107' }]}>★ Premium</Text></View>}
            <View style={[styles.badge, { borderColor: bgColor }]}><Text style={[styles.badgeText, { color: bgColor }]}>{trainer.category?.replace('-', ' ')}</Text></View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>⭐ {trainer.rating}</Text><Text style={styles.statLabel}>{trainer.totalReviews} reviews</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{trainer.experience}yr</Text><Text style={styles.statLabel}>Experience</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>₹{trainer.pricing}</Text><Text style={styles.statLabel}>{trainer.priceUnit}</Text></View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio} numberOfLines={showFullBio ? undefined : 3}>{trainer.bio}</Text>
          {trainer.bio.length > 100 && (
            <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
              <Text style={styles.showMore}>{showFullBio ? 'Show less' : 'Show more'}</Text>
            </TouchableOpacity>
          )}

          {trainer.resume && (
            <TouchableOpacity 
              style={styles.resumeBtn} 
              onPress={() => Linking.openURL(trainer.resume!)}
            >
              <Text style={styles.resumeBtnText}>📄 View Full Resume</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Specializations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.tags}>
            {trainer.specializations?.map((s, i) => (
              <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
            ))}
          </View>
        </View>

        {/* Certifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {trainer.certifications?.map((c, i) => (
            <View key={i} style={styles.certItem}><Text style={styles.certIcon}>🏅</Text><Text style={styles.certText}>{c}</Text></View>
          ))}
        </View>

        {/* Session Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Types</Text>
          {trainer.sessionTypes?.map((s, i) => (
            <View key={i} style={styles.sessionItem}><Text style={styles.sessionText}>{s}</Text></View>
          ))}
        </View>

        {/* Location & Languages */}
        <View style={styles.section}>
          <Text style={styles.infoRow}>📍 {trainer.city}</Text>
          <Text style={styles.infoRow}>🗣️ {trainer.languages?.join(', ')}</Text>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.slice(0, 5).map((r) => (
            <View key={r._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{(r.userId as any)?.name || 'User'}</Text>
                <Text style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</Text>
              </View>
              <Text style={styles.reviewText}>{r.comment}</Text>
            </View>
          ))}
          {reviews.length === 0 && <Text style={styles.noReviews}>No reviews yet</Text>}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Book Button */}
      <View style={styles.bookBar}>
        <View>
          <Text style={styles.bookPrice}>₹{trainer.pricing}</Text>
          <Text style={styles.bookUnit}>{trainer.priceUnit}</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={() => router.push({ pathname: '/(user)/booking/[id]', params: { id: trainer._id } })}>
          <Text style={styles.bookBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  errorText: { color: '#F44336', fontSize: 16 },
  hero: { paddingTop: 60, paddingBottom: 24, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { position: 'absolute', top: 50, left: 20 },
  backText: { color: '#FF5722', fontSize: 16, fontWeight: '600' },
  favBtn: { position: 'absolute', top: 50, right: 20 },
  favIcon: { fontSize: 24 },
  avatarLarge: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', color: '#fff' },
  badges: { flexDirection: 'row', marginTop: 10, gap: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#4CAF50' },
  premiumBadge: { borderColor: '#FFC107' },
  badgeText: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  stats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1a1a1a', marginHorizontal: 20, borderRadius: 16, padding: 16, marginTop: -16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#9E9E9E', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  bio: { color: '#9E9E9E', fontSize: 14, lineHeight: 22 },
  showMore: { color: '#FF5722', fontSize: 13, marginTop: 6, fontWeight: '500' },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start' },
  resumeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#242424' },
  tagText: { color: '#fff', fontSize: 13 },
  certItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  certIcon: { fontSize: 16, marginRight: 10 },
  certText: { color: '#fff', fontSize: 14 },
  sessionItem: { backgroundColor: '#242424', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginBottom: 8 },
  sessionText: { color: '#fff', fontSize: 14 },
  infoRow: { color: '#9E9E9E', fontSize: 14, marginBottom: 6 },
  reviewCard: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewUser: { color: '#fff', fontWeight: '600', fontSize: 14 },
  reviewRating: { fontSize: 12 },
  reviewText: { color: '#9E9E9E', fontSize: 13, lineHeight: 20 },
  noReviews: { color: '#666', fontSize: 14 },
  bookBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a1a', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 34 },
  bookPrice: { fontSize: 20, fontWeight: '700', color: '#fff' },
  bookUnit: { fontSize: 12, color: '#9E9E9E' },
  bookBtn: { backgroundColor: '#FF5722', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
