import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions, Platform, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedRN, { FadeInDown } from 'react-native-reanimated';
import { Shield, Zap, TrendingUp, ChevronRight, Star, Clock } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../store/authStore';
import { trainerAPI, contentAPI, bookingAPI, userAPI } from '../../../services/endpoints';
import { Trainer, Category } from '../../../types';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';
import SkeletonLoader from '../../../components/SkeletonLoader';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const FeaturedTrainerCard = ({ trainer, onPress }: { trainer: any; onPress: () => void }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const portfolioImages = useMemo(() => [...(trainer.portfolioImages || [])].sort(() => Math.random() - 0.5), [trainer.portfolioImages]);

  useEffect(() => {
    if (portfolioImages.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0.2, duration: 300, useNativeDriver: true }).start(() => {
        setActiveImageIndex((prev) => (prev + 1) % portfolioImages.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [portfolioImages.length, fadeAnim]);

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
      <View style={{ height: '65%', width: '100%', position: 'relative' }}>
        {portfolioImages.length > 0 ? (
          <Animated.Image source={{ uri: portfolioImages[activeImageIndex] }} style={{ ...StyleSheet.absoluteFillObject, resizeMode: 'cover', opacity: fadeAnim }} />
        ) : (
          <Image source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500&auto=format&fit=crop' }} style={{ ...StyleSheet.absoluteFillObject, resizeMode: 'cover' }} />
        )}
        {trainer.premium && (<View style={styles.premiumBadge}><Text style={styles.premiumText}>★ PREMIUM</Text></View>)}
        {portfolioImages.length > 1 && (
          <View style={{ flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center', gap: 4 }}>
            {portfolioImages.map((_: any, idx: number) => (
              <View key={idx} style={{ width: idx === activeImageIndex ? 12 : 4, height: 4, borderRadius: 2, backgroundColor: idx === activeImageIndex ? theme.accent.purple : 'rgba(255,255,255,0.5)' }} />
            ))}
          </View>
        )}
      </View>
      <View style={styles.featuredInfo}>
        <Avatar uri={trainer.profilePhoto || trainer.profileImage} name={trainer.fullName} size="sm" borderColor={theme.accent.purple} />
        <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
          <Text style={styles.featuredName} numberOfLines={1}>{trainer.fullName} {trainer.verified ? '✓' : ''}</Text>
          <Text style={styles.featuredCategory}>{trainer.category} • {trainer.experience || 0} YRS</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.featuredPrice}>₹{trainer.pricing}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
            <Star size={11} color={theme.status.warning} fill={theme.status.warning} />
            <Text style={styles.featuredRating}>{trainer.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Sweat is just fat crying.", "What seems impossible today will one day become your warm-up.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "A one hour workout is 4% of your day. No excuses.",
    "It never gets easier, you just get stronger.", "Success starts with self-discipline.",
    "Don't stop when you're tired. Stop when you're done.",
    "The body achieves what the mind believes.", "You don't have to be extreme, just consistent.",
    "Excuses don't burn calories."
  ];

  const getLocalQuote = () => { const now = new Date(); const start = new Date(now.getFullYear(), 0, 0); const diff = now.getTime() - start.getTime(); const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)); return quotes[dayOfYear % quotes.length]; };

  const [todayQuote, setTodayQuote] = useState(getLocalQuote());
  const [platformStats, setPlatformStats] = useState({ trainersCount: 0, categoriesCount: 0, bookingsCount: 0 });
  const [userStats, setUserStats] = useState({ completedSessions: 0, upcomingSessionTime: null as string | null, totalFavorites: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const formatStat = (num: number) => { if (num === 0) return '...'; if (num < 10) return num.toString(); if (num < 100) return `${Math.floor(num / 10) * 10}+`; if (num < 1000) return `${Math.floor(num / 100) * 100}+`; return `${Math.floor(num / 1000)}K+`; };

  const stats = [
    { icon: <Shield color={theme.status.info} size={24} />, number: formatStat(platformStats.trainersCount), label: 'Verified Trainers' },
    { icon: <Zap color={theme.accent.orange} size={24} />, number: formatStat(platformStats.categoriesCount), label: 'Activities' },
    { icon: <TrendingUp color={theme.accent.purple} size={24} />, number: formatStat(platformStats.bookingsCount), label: 'Sessions Booked' },
  ];

  const fetchData = async () => {
    try {
      const [catRes, featRes, statsRes, bookingsRes, favRes] = await Promise.all([
        trainerAPI.getCategories(), trainerAPI.getFeatured(),
        trainerAPI.getPlatformStats().catch(() => null), bookingAPI.getUserBookings().catch(() => null), userAPI.getFavorites().catch(() => null)
      ]);
      if (catRes.data.data) setCategories(catRes.data.data);
      if (featRes.data.data) setFeatured(featRes.data.data);
      if (statsRes?.data?.data) setPlatformStats(statsRes.data.data);
      let completedCount = 0; let upcomingTime = null;
      if (bookingsRes?.data?.data) {
        const bookings = bookingsRes.data.data;
        completedCount = bookings.filter((b: any) => b.bookingStatus === 'completed').length;
        const upcoming = bookings.filter((b: any) => b.bookingStatus === 'confirmed' && new Date(b.bookingDate) >= new Date()).sort((a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())[0];
        if (upcoming) upcomingTime = new Date(upcoming.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + upcoming.timeSlot;
      }
      setUserStats({ completedSessions: completedCount, upcomingSessionTime: upcomingTime, totalFavorites: favRes?.data?.data?.length || 0 });
    } catch (err) { console.log('Error fetching data:', err); }
    finally { setLoading(false); }
  };

  const sliderWidth = Math.min(width - 40, 400);
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => { const next = (prev + 1) % stats.length; scrollViewRef.current?.scrollTo({ x: next * sliderWidth, animated: true }); return next; });
      setTodayQuote(getLocalQuote());
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderWidth]);

  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };
  const userName = (user as any)?.name || (user as any)?.fullName || 'User';

  const catIcons: any = { gym: 'fitness-center', yoga: 'self-improvement', swimming: 'pool', badminton: 'sports-tennis', 'martial-arts': 'sports-martial-arts', dance: 'audiotrack', cricket: 'sports-cricket', football: 'sports-soccer', tennis: 'sports-tennis', basketball: 'sports-basketball', running: 'directions-run', cycling: 'directions-bike', golf: 'sports-golf', nutrition: 'restaurant', meditation: 'spa', physiotherapy: 'healing', fitness: 'fitness-center', sports: 'emoji-events' };
  const catGradients: any = { gym: ['#2C3E50', '#000000'], yoga: ['#4A235A', '#150620'], swimming: ['#1B4F72', '#061D2E'], badminton: ['#0E6251', '#031E18'], 'martial-arts': ['#78281F', '#240A07'], dance: ['#512E5F', '#190C1F'], cricket: ['#7E5109', '#2C1B02'], football: ['#154360', '#041520'], tennis: ['#186A3B', '#052211'], basketball: ['#873600', '#301100'], running: ['#0B5345', '#021B16'], cycling: ['#422953', '#17081D'], golf: ['#1D8348', '#072E18'], nutrition: ['#7D6608', '#2A2101'], meditation: ['#0E6655', '#03201A'], physiotherapy: ['#641E16', '#1E0603'], fitness: ['#1A5276', '#061722'], sports: ['#9A7D0A', '#2D2302'] };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ padding: spacing.xl, paddingTop: spacing['5xl'] }}>
          <SkeletonLoader variant="text" count={1} />
          <View style={{ height: spacing.xl }} />
          <SkeletonLoader variant="card" count={2} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrapper}>
        {/* Hero */}
        <AnimatedRN.View entering={FadeInDown.duration(400).delay(100)} style={styles.heroSection}>
          <Text style={styles.welcomeText}>Welcome back, <Text style={styles.welcomeName}>{userName}</Text></Text>
          <Text style={styles.heroTitle}>Ready to start?</Text>

          {/* User Dashboard */}
          <Card style={styles.dashboardCard}>
            <Text style={styles.dashboardTitle}>Your Dashboard</Text>
            <View style={styles.userStatsGrid}>
              <Card variant="elevated" style={styles.userStatCard}>
                <Text style={[styles.userStatValue, { color: theme.status.success }]}>{userStats.completedSessions}</Text>
                <Text style={styles.userStatLabel}>SESSIONS</Text>
              </Card>
              <Card variant="elevated" style={styles.userStatCard}>
                <Text style={[styles.userStatValue, { color: theme.accent.pink }]}>{userStats.totalFavorites}</Text>
                <Text style={styles.userStatLabel}>FAVORITES</Text>
              </Card>
              <Card variant="elevated" style={[styles.userStatCard, styles.upcomingCard]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Clock size={14} color={theme.accent.cyan} />
                  <Text style={styles.upcomingLabel}>Next Session</Text>
                </View>
                <Text style={styles.upcomingValue} numberOfLines={1}>{userStats.upcomingSessionTime || 'None scheduled'}</Text>
              </Card>
            </View>
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>"{todayQuote}"</Text>
            </View>
          </Card>
        </AnimatedRN.View>

        {/* Platform Stats Carousel */}
        <AnimatedRN.View entering={FadeInDown.duration(400).delay(200)} style={styles.statsWrapper}>
          <View style={{ width: sliderWidth, overflow: 'hidden', borderRadius: radius.lg }}>
            <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} pagingEnabled scrollEnabled={!isWeb}>
              {stats.map((stat, idx) => (
                <View key={idx} style={[styles.statBox, { width: sliderWidth }]}>
                  {stat.icon}
                  <View style={{ marginLeft: spacing.md }}>
                    <Text style={styles.statNumber}>{stat.number}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.dotsContainer}>
            {stats.map((_, idx) => (<View key={idx} style={[styles.dot, activeStatIndex === idx && styles.activeDot]} />))}
          </View>
        </AnimatedRN.View>

        {/* Categories */}
        <AnimatedRN.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(user)/(tabs)/search')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={theme.accent.purple} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: spacing.lg }}>
            {categories.map((cat: any) => (
              <TouchableOpacity key={cat._id} activeOpacity={0.8} onPress={() => router.push({ pathname: '/(user)/(tabs)/search', params: { category: cat.slug } })}>
                <LinearGradient colors={catGradients[cat.slug] || ['#FF8A65', '#B388FF']} style={styles.categoryBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.categoryIconCircle}>
                    <MaterialIcons name={catIcons[cat.slug] || 'sports'} color="#fff" size={28} />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedRN.View>

        {/* Featured Trainers */}
        <AnimatedRN.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Trainers</Text>
            <TouchableOpacity onPress={() => router.push('/(user)/(tabs)/search')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={theme.accent.purple} />
            </TouchableOpacity>
          </View>
          <View style={styles.featuredContainer}>
            {featured.map((trainer: Trainer) => (
              <FeaturedTrainerCard key={trainer._id} trainer={trainer} onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: trainer._id } })} />
            ))}
          </View>
        </AnimatedRN.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  scrollContent: { paddingBottom: spacing['6xl'], alignItems: isWeb ? 'center' as const : 'stretch' as const },
  contentWrapper: { width: '100%', maxWidth: 1200, paddingHorizontal: spacing.xl },
  heroSection: { paddingTop: spacing['4xl'], paddingBottom: spacing.md },
  welcomeText: { ...typography.body, color: theme.text.secondary },
  welcomeName: { color: theme.accent.purple, fontWeight: '700' },
  heroTitle: { ...typography.hero, color: theme.text.primary, marginTop: spacing.xs },
  dashboardCard: { marginTop: spacing.lg, padding: spacing.lg },
  dashboardTitle: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.lg },
  userStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  userStatCard: { flex: 1, minWidth: '28%', padding: spacing.md, alignItems: 'center' },
  userStatValue: { ...typography.stat, color: theme.text.primary },
  userStatLabel: { ...typography.micro, color: theme.text.muted, marginTop: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  upcomingCard: { minWidth: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg },
  upcomingLabel: { ...typography.bodySmall, color: theme.text.secondary },
  upcomingValue: { ...typography.bodyMedium, color: theme.accent.cyan, flexShrink: 1 },
  quoteCard: { backgroundColor: 'rgba(255, 179, 0, 0.06)', borderRadius: radius.md, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: theme.accent.orange },
  quoteText: { ...typography.bodySmall, color: theme.text.secondary, fontStyle: 'italic', lineHeight: 20 },
  statsWrapper: { marginVertical: spacing.md, alignItems: isWeb ? 'center' as const : 'flex-start' as const },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg.elevated, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: radius.lg },
  statNumber: { ...typography.h3, color: theme.text.primary },
  statLabel: { ...typography.caption, color: theme.text.muted, marginTop: 2 },
  dotsContainer: { flexDirection: 'row', justifyContent: 'center', width: isWeb ? 'auto' : width - 40, marginTop: spacing.lg, gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.bg.hover },
  activeDot: { backgroundColor: theme.accent.purple, width: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: theme.text.primary },
  seeAllText: { ...typography.bodySmall, color: theme.accent.purple, fontWeight: '600' },
  categoryBox: { width: 90, height: 100, borderRadius: radius.lg, padding: spacing.sm, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'center' },
  categoryIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  categoryName: { ...typography.micro, color: '#fff', fontWeight: '800', textAlign: 'center' },
  featuredContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.xl },
  featuredCard: { width: width > 768 ? '48%' : '100%', height: 220, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: theme.bg.elevated, borderWidth: 1, borderColor: theme.border.default },
  featuredInfo: { flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center' },
  featuredName: { ...typography.bodyMedium, color: theme.text.primary, fontWeight: '700' },
  featuredCategory: { ...typography.micro, color: theme.accent.purple, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  featuredRating: { ...typography.caption, color: theme.text.secondary },
  featuredPrice: { ...typography.h3, color: theme.text.primary, fontWeight: '800' },
  premiumBadge: { position: 'absolute', top: spacing.lg, right: spacing.lg, backgroundColor: theme.accent.orange, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm, zIndex: 10 },
  premiumText: { ...typography.micro, color: '#fff', fontWeight: '800' },
});
