import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heart, Star, MapPin, Globe, MessageCircle, ArrowLeft, FileText, Award, CheckCircle } from 'lucide-react-native';
import { trainerAPI } from '../../../services/endpoints';
import { Trainer, Review } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/api';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import AvatarComp from '../../../components/Avatar';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import SkeletonLoader from '../../../components/SkeletonLoader';
import Button from '../../../components/Button';

export default function TrainerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser, role } = useAuthStore();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  const favs = (user as any)?.favorites || [];
  const isFavorite = favs.includes(id) || favs.some((f: any) => f?._id === id || f === id);

  useEffect(() => {
    (async () => {
      try { const [tRes, rRes] = await Promise.all([trainerAPI.getById(id!), trainerAPI.getReviews(id!)]); setTrainer(tRes.data.data); setReviews(rRes.data.data || []); } catch {}
      setLoading(false);
    })();
  }, [id]);

  const toggleFavorite = async () => {
    const newFavs = isFavorite ? favs.filter((f: any) => f !== id && f?._id !== id) : [...favs, id];
    setUser({ ...user, favorites: newFavs }, role || 'user');
    try { const res = await api.post(`/users/favorites/${id}`); setUser({ ...user, favorites: res.data.data.favorites }, role || 'user'); }
    catch { setUser({ ...user, favorites: favs }, role || 'user'); }
  };

  if (loading) return <View style={styles.loadingState}><SkeletonLoader variant="card" count={3} /></View>;
  if (!trainer) return <View style={styles.loadingState}><Text style={{ ...typography.body, color: theme.status.error }}>Trainer not found</Text></View>;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/home')}>
            <ArrowLeft size={22} color={theme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite}>
            <Heart size={22} color={isFavorite ? theme.status.error : theme.text.secondary} fill={isFavorite ? theme.status.error : 'transparent'} />
          </TouchableOpacity>
          <AvatarComp uri={trainer.profilePhoto || trainer.profileImage} name={trainer.fullName} size="xl" />
          <Text style={styles.name}>{trainer.fullName}</Text>
          <View style={styles.badges}>
            {trainer.verified && <View style={[styles.badge, { borderColor: theme.status.success }]}><CheckCircle size={12} color={theme.status.success} /><Text style={[styles.badgeText, { color: theme.status.success }]}>Verified</Text></View>}
            {trainer.premium && <View style={[styles.badge, { borderColor: theme.status.warning }]}><Star size={12} color={theme.status.warning} fill={theme.status.warning} /><Text style={[styles.badgeText, { color: theme.status.warning }]}>Premium</Text></View>}
            <View style={[styles.badge, { borderColor: theme.accent.purple }]}><Text style={[styles.badgeText, { color: theme.accent.purple }]}>{trainer.category?.replace('-', ' ')}</Text></View>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Card style={styles.statsCard}>
            <View style={styles.stat}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Star size={16} color={theme.status.warning} fill={theme.status.warning} /><Text style={styles.statValue}>{trainer.rating}</Text></View><Text style={styles.statLabel}>{trainer.totalReviews} reviews</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statValue}>{trainer.experience}yr</Text><Text style={styles.statLabel}>Experience</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={[styles.statValue, { color: theme.accent.purple }]}>₹{trainer.pricing}</Text><Text style={styles.statLabel}>{trainer.priceUnit}</Text></View>
          </Card>
        </Animated.View>

        {/* Bio */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio} numberOfLines={showFullBio ? undefined : 3}>{trainer.bio}</Text>
          {trainer.bio?.length > 100 && <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}><Text style={styles.showMore}>{showFullBio ? 'Show less' : 'Show more'}</Text></TouchableOpacity>}
        </Animated.View>

        {/* Resume */}
        {trainer.resume && (
          <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.section}>
            <TouchableOpacity style={styles.resumeBtn} onPress={() => Linking.openURL(trainer.resume!)}>
              <FileText size={18} color={theme.accent.purple} /><Text style={styles.resumeBtnText}>View Resume</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Portfolio */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false}>
            {(trainer.portfolioImages?.length ? trainer.portfolioImages : [
              'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=500&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500&auto=format&fit=crop'
            ]).map((img, idx) => (<Image key={idx} source={{ uri: img }} style={styles.portfolioImg} />))}
          </ScrollView>
        </Animated.View>

        {/* Specializations */}
        {trainer.specializations?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(350)} style={styles.section}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <View style={styles.tags}>{trainer.specializations.map((s, i) => <Chip key={i} label={s} selected={false} onPress={() => {}} size="sm" />)}</View>
          </Animated.View>
        )}

        {/* Certifications */}
        {trainer.certifications?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {trainer.certifications.map((c, i) => (<View key={i} style={styles.certItem}><Award size={16} color={theme.status.warning} /><Text style={styles.certText}>{c}</Text></View>))}
          </Animated.View>
        )}

        {/* Session Types */}
        {trainer.sessionTypes?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(450)} style={styles.section}>
            <Text style={styles.sectionTitle}>Session Types</Text>
            {trainer.sessionTypes.map((s, i) => (<Card key={i} style={styles.sessionItem}><Text style={styles.sessionText}>{s}</Text></Card>))}
          </Animated.View>
        )}

        {/* Info */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.section}>
          <View style={styles.infoRow}><MapPin size={14} color={theme.text.muted} /><Text style={styles.infoText}>{trainer.city}</Text></View>
          {trainer.languages?.length > 0 && <View style={styles.infoRow}><Globe size={14} color={theme.text.muted} /><Text style={styles.infoText}>{trainer.languages.join(', ')}</Text></View>}
        </Animated.View>

        {/* Reviews */}
        <Animated.View entering={FadeInDown.duration(400).delay(550)} style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.slice(0, 5).map((r) => (
            <Card key={r._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{(r.userId as any)?.name || 'User'}</Text>
                <View style={{ flexDirection: 'row', gap: 2 }}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} color={theme.status.warning} fill={theme.status.warning} />)}</View>
              </View>
              <Text style={styles.reviewText}>{r.comment}</Text>
            </Card>
          ))}
          {reviews.length === 0 && <Text style={styles.noReviews}>No reviews yet</Text>}
        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Book Bar */}
      <View style={[styles.bookBar, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookPrice}>₹{trainer.pricing}</Text>
          <Text style={styles.bookUnit}>{trainer.priceUnit}</Text>
        </View>
        <Button title="💬 Chat" variant="ghost" size="sm" onPress={() => router.push({ pathname: '/(user)/chat/[id]' as any, params: { id: trainer._id } })} style={{ marginRight: spacing.sm }} />
        <Button title="Book Now" onPress={() => router.push({ pathname: '/(user)/booking/[id]', params: { id: trainer._id } })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg.primary, padding: spacing.xl },
  hero: { paddingBottom: spacing['3xl'], alignItems: 'center', backgroundColor: `${theme.accent.purple}10`, borderBottomLeftRadius: radius['2xl'], borderBottomRightRadius: radius['2xl'] },
  backBtn: { position: 'absolute', top: Platform.OS === 'web' ? 30 : 54, left: spacing.lg, width: 40, height: 40, borderRadius: radius.full, backgroundColor: theme.bg.card, alignItems: 'center', justifyContent: 'center' },
  favBtn: { position: 'absolute', top: Platform.OS === 'web' ? 30 : 54, right: spacing.lg, width: 40, height: 40, borderRadius: radius.full, backgroundColor: theme.bg.card, alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.h2, color: theme.text.primary, marginTop: spacing.md },
  badges: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { ...typography.caption, fontWeight: '600' },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: spacing.lg, marginTop: -spacing['2xl'], padding: spacing.lg },
  stat: { alignItems: 'center' },
  statValue: { ...typography.h3, color: theme.text.primary },
  statLabel: { ...typography.caption, color: theme.text.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: theme.border.subtle },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.md },
  bio: { ...typography.body, color: theme.text.secondary, lineHeight: 22 },
  showMore: { ...typography.bodySmall, color: theme.accent.purple, fontWeight: '600', marginTop: spacing.xs },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: theme.bg.card, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: theme.border.subtle, alignSelf: 'flex-start' },
  resumeBtnText: { ...typography.bodyMedium, color: theme.text.primary },
  portfolioImg: { width: 140, height: 140, borderRadius: radius.lg, marginRight: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  certItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  certText: { ...typography.body, color: theme.text.primary },
  sessionItem: { marginBottom: spacing.sm, padding: spacing.md },
  sessionText: { ...typography.body, color: theme.text.primary },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  infoText: { ...typography.body, color: theme.text.secondary },
  reviewCard: { marginBottom: spacing.sm, padding: spacing.lg },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  reviewUser: { ...typography.bodyMedium, color: theme.text.primary },
  reviewText: { ...typography.bodySmall, color: theme.text.secondary, lineHeight: 20 },
  noReviews: { ...typography.bodySmall, color: theme.text.muted },
  bookBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.bg.secondary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: theme.border.subtle },
  bookPrice: { ...typography.h2, color: theme.accent.purple },
  bookUnit: { ...typography.caption, color: theme.text.muted },
});
