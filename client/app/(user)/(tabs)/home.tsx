import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { trainerAPI, contentAPI } from '../../../services/endpoints';
import { Trainer, Category } from '../../../types';
import { Shield, Zap, TrendingUp } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Trainer[]>([]);
  const [todayQuote, setTodayQuote] = useState("The only bad workout is the one that didn't happen.");
  const [platformStats, setPlatformStats] = useState({ trainersCount: 0, categoriesCount: 0, bookingsCount: 0 });
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const formatStat = (num: number) => {
    if (num === 0) return '...';
    if (num < 10) return num.toString();
    if (num < 100) return `${Math.floor(num / 10) * 10}+`;
    if (num < 1000) return `${Math.floor(num / 100) * 100}+`;
    if (num < 10000) return `${Math.floor(num / 100) * 100}+`;
    if (num < 1000000) return `${Math.floor(num / 1000)}K+`;
    return `${Math.floor(num / 1000000)}M+`;
  };

  const stats = [
    { icon: <Shield color="#2196F3" size={24} style={{ marginRight: 12 }} />, number: formatStat(platformStats.trainersCount), label: 'Verified Trainers' },
    { icon: <Zap color="#FF9800" size={24} style={{ marginRight: 12 }} />, number: formatStat(platformStats.categoriesCount), label: 'Activities' },
    { icon: <TrendingUp color="#9E7CFF" size={24} style={{ marginRight: 12 }} />, number: formatStat(platformStats.bookingsCount), label: 'Sessions Booked' },
  ];

  const fetchData = async () => {
    try {
      const [catRes, featRes, quoteRes, statsRes] = await Promise.all([
        trainerAPI.getCategories(),
        trainerAPI.getFeatured(),
        contentAPI.getDailyQuote().catch(() => ({ data: { data: { text: "The only bad workout is the one that didn't happen." } } })),
        trainerAPI.getPlatformStats().catch(() => null)
      ]);
      if (catRes.data.data) setCategories(catRes.data.data);
      if (featRes.data.data) setFeatured(featRes.data.data);
      if (quoteRes.data?.data?.text) setTodayQuote(quoteRes.data.data.text);
      if (statsRes?.data?.data) setPlatformStats(statsRes.data.data);
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };

  const sliderWidth = Math.min(width - 40, 400); // Responsive width for the carousel

  useEffect(() => { 
    fetchData(); 
    
    // Auto slide for stats
    const interval = setInterval(() => {
      setActiveStatIndex((prev) => {
        const next = (prev + 1) % stats.length;
        scrollViewRef.current?.scrollTo({ x: next * sliderWidth, animated: true });
        return next;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [sliderWidth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const userName = (user as any)?.name || (user as any)?.fullName || 'User';

  const catIcons: any = {
    gym: <MaterialIcons name="fitness-center" color="#fff" size={32} />,
    yoga: <MaterialIcons name="self-improvement" color="#fff" size={32} />,
    swimming: <MaterialIcons name="pool" color="#fff" size={32} />,
    badminton: <MaterialIcons name="sports-tennis" color="#fff" size={32} />, // Racket
    'martial-arts': <MaterialIcons name="sports-martial-arts" color="#fff" size={32} />, // No swords
    dance: <MaterialIcons name="audiotrack" color="#fff" size={32} />,
    cricket: <MaterialIcons name="sports-cricket" color="#fff" size={32} />, // Bat and ball
    football: <MaterialIcons name="sports-soccer" color="#fff" size={32} />, // Football
  };

  const catColors: any = {
    gym: '#FF5722',
    yoga: '#7C4DFF',
    swimming: '#00BCD4',
    badminton: '#4CAF50',
    'martial-arts': '#F44336',
    dance: '#E91E63',
    cricket: '#FF9800',
    football: '#2196F3',
  };
  
  const trainerBgColors = ['#F44336', '#7C4DFF', '#00BCD4', '#4CAF50', '#2196F3', '#FF9800'];

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5722" />}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.heroSection}>
          <Text style={styles.welcomeText}>
            Welcome back, <Text style={styles.welcomeName}>{userName}</Text>
          </Text>
          <Text style={styles.heroTitle}>Ready to train?</Text>

          <TouchableOpacity 
            style={styles.searchBar} 
            onPress={() => router.push('/(user)/(tabs)/search')}
            activeOpacity={0.9}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search trainers, yoga, gym...</Text>
          </TouchableOpacity>

          <View style={styles.quoteContainer}>
            <Text style={styles.quoteLabel}>💡 Today's Motivation</Text>
            <Text style={styles.quoteText}>"{todayQuote}"</Text>
          </View>
        </View>

        <View style={styles.statsWrapper}>
          <View style={{ width: sliderWidth, overflow: 'hidden', borderRadius: 16 }}>
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              scrollEnabled={!isWeb} // Let interval control it on web, or allow swipe on native
            >
              {stats.map((stat, idx) => (
                <View key={idx} style={[styles.statBox, { width: sliderWidth }]}>
                  {stat.icon}
                  <View>
                    <Text style={styles.statNumber}>{stat.number}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.dotsContainer}>
            {stats.map((_, idx) => (
              <View key={idx} style={[styles.dot, activeStatIndex === idx && styles.activeDot]} />
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/(tabs)/search')}>
            <Text style={styles.seeAllText}>See all {'>'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {categories.map((cat: any) => (
            <TouchableOpacity 
              key={cat._id} 
              style={[styles.categoryBox, { backgroundColor: catColors[cat.slug] || '#FF7043' }]}
              onPress={() => router.push({ pathname: '/(user)/(tabs)/search', params: { category: cat.slug } })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIconWrapper}>
                {catIcons[cat.slug] || <MaterialIcons name="sports" color="#fff" size={32} />}
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Trainers</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/(tabs)/search')}>
            <Text style={styles.seeAllText}>See all {'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuredContainer}>
          {featured.map((trainer: Trainer, index: number) => {
            const initials = trainer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2);
            const bgColor = trainerBgColors[index % trainerBgColors.length];
            return (
              <TouchableOpacity 
                key={trainer._id} 
                style={[styles.featuredCard, { backgroundColor: bgColor }]}
                onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: trainer._id } })}
                activeOpacity={0.9}
              >
                {trainer.premium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumText}>★ PREMIUM</Text>
                  </View>
                )}
                
                <View style={styles.featuredCenter}>
                  {trainer.profilePhoto || (trainer as any).profileImage ? (
                    <Image 
                      source={{ uri: trainer.profilePhoto || (trainer as any).profileImage }} 
                      style={styles.featuredImage}
                    />
                  ) : (
                    <Text style={styles.featuredInitials}>{initials}</Text>
                  )}
                </View>
                
                <View style={styles.featuredFooter}>
                  <View>
                    <Text style={styles.featuredName}>{trainer.fullName} {trainer.verified ? '✓' : ''}</Text>
                    <Text style={styles.featuredRating}>⭐ {trainer.rating} <Text style={{ color: '#9E9E9E', fontSize: 11 }}>({trainer.totalReviews || 0} reviews)</Text></Text>
                  </View>
                  <Text style={styles.featuredPrice}>₹{trainer.pricing}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  scrollContent: { paddingBottom: 100, alignItems: isWeb ? 'center' : 'stretch' },
  contentWrapper: { width: '100%', maxWidth: 1200, paddingHorizontal: 20 },
  
  heroSection: {
    paddingTop: Platform.OS === 'web' ? 60 : 40,
    paddingBottom: 20,
  },
  welcomeText: { color: '#9E9E9E', fontSize: 16, marginBottom: 8 },
  welcomeName: { color: '#FF5722', fontWeight: '700' },
  heroTitle: { color: '#ffffff', fontSize: 48, fontWeight: '800', marginBottom: 30, letterSpacing: -1 },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    maxWidth: 600,
  },
  searchIcon: { fontSize: 18, marginRight: 12, opacity: 0.7 },
  searchPlaceholder: { color: '#777', fontSize: 16 },

  quoteContainer: {
    marginTop: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  quoteLabel: { color: '#FF5722', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  quoteText: { color: '#E0E0E0', fontSize: 15, fontStyle: 'italic', lineHeight: 22 },

  statsWrapper: {
    marginTop: 10,
    marginBottom: 40,
    alignItems: isWeb ? 'center' : 'flex-start',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  statNumber: { color: '#fff', fontSize: 20, fontWeight: '700' },
  statLabel: { color: '#777', fontSize: 13, marginTop: 4 },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: isWeb ? 'auto' : width - 40,
    marginTop: 16,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  activeDot: { backgroundColor: '#FF5722', width: 24 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  seeAllText: { color: '#FF5722', fontSize: 14, fontWeight: '600' },

  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryBox: {
    width: 140,
    height: 140,
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconWrapper: {
    marginBottom: 16,
  },
  categoryName: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },

  featuredContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  featuredCard: {
    width: width > 768 ? '48%' : '100%',
    height: 260,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  premiumBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  featuredCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  featuredInitials: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: 2,
    opacity: 0.9,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
    margin: -24,
    padding: 24,
    paddingTop: 16,
  },
  featuredName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  featuredRating: { color: '#fff', fontSize: 14, opacity: 0.9 },
  featuredPrice: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
