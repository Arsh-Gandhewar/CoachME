import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { trainerAPI, contentAPI } from '../../../services/endpoints';
import { Trainer, Category } from '../../../types';
import { Shield, Zap, TrendingUp } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const FeaturedTrainerCard = ({ trainer, bgColor, onPress }: { trainer: any, bgColor: string, onPress: () => void }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const portfolioImages = trainer.portfolioImages || [];

  useEffect(() => {
    if (portfolioImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % portfolioImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [portfolioImages.length]);

  const initials = trainer.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <TouchableOpacity 
      style={[styles.featuredCard, { backgroundColor: bgColor, padding: 0 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {trainer.premium && (
        <View style={[styles.premiumBadge, { zIndex: 10 }]}>
          <Text style={styles.premiumText}>★ PREMIUM</Text>
        </View>
      )}
      
      {/* Row Layout for Profile and Portfolio */}
      <View style={{ flex: 1, flexDirection: 'row', padding: 20, paddingBottom: 0 }}>
        
        {/* Left Side: Profile Image */}
        <View style={{ justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
          {trainer.profilePhoto || trainer.profileImage ? (
            <Image 
              source={{ uri: trainer.profilePhoto || trainer.profileImage }} 
              style={styles.featuredImage}
            />
          ) : (
            <View style={[styles.featuredImage, { backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>{initials}</Text>
            </View>
          )}
        </View>

        {/* Right Side: Light Grey Scrolling Area */}
        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
          {portfolioImages.length > 0 ? (
            <Image 
              source={{ uri: portfolioImages[activeImageIndex] }} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          ) : (
            <Text style={{ color: '#aaa', fontSize: 10, textAlign: 'center', padding: 10 }}>No portfolio</Text>
          )}

          {/* Dots inside the light grey area */}
          {portfolioImages.length > 1 && (
            <View style={{ flexDirection: 'row', position: 'absolute', bottom: 8, gap: 4 }}>
              {portfolioImages.map((_, idx) => (
                <View key={idx} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: idx === activeImageIndex ? '#C9B07D' : 'rgba(255,255,255,0.4)' }} />
              ))}
            </View>
          )}
        </View>
      </View>
      
      <View style={[styles.featuredFooter, { paddingHorizontal: 20 }]}>
        <View>
          <Text style={styles.featuredName}>{trainer.fullName} {trainer.verified ? '✓' : ''}</Text>
          <Text style={{ color: '#C9B07D', fontSize: 10, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' }}>{trainer.category} • {trainer.experience || 0} yrs exp</Text>
          <Text style={styles.featuredRating}>⭐ {trainer.rating} <Text style={{ color: '#A1A1AA', fontSize: 10 }}>({trainer.totalReviews || 0})</Text></Text>
        </View>
        <Text style={styles.featuredPrice}>₹{trainer.pricing}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Trainer[]>([]);
  const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Sweat is just fat crying.",
    "What seems impossible today will one day become your warm-up.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "A one hour workout is 4% of your day. No excuses.",
    "The hardest lift of all is lifting your butt off the couch.",
    "It never gets easier, you just get stronger.",
    "Success starts with self-discipline.",
    "Don't stop when you're tired. Stop when you're done.",
    "The body achieves what the mind believes.",
    "You don't have to be extreme, just consistent.",
    "Excuses don't burn calories."
  ];

  const getLocalQuote = () => {
    // Calculate local day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return quotes[dayOfYear % quotes.length];
  };

  const [todayQuote, setTodayQuote] = useState(getLocalQuote());
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
      const [catRes, featRes, statsRes] = await Promise.all([
        trainerAPI.getCategories(),
        trainerAPI.getFeatured(),
        trainerAPI.getPlatformStats().catch(() => null)
      ]);
      if (catRes.data.data) setCategories(catRes.data.data);
      if (featRes.data.data) setFeatured(featRes.data.data);
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

      // Update quote exactly at midnight local time without reloading
      setTodayQuote(getLocalQuote());
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
    badminton: <MaterialIcons name="sports-tennis" color="#fff" size={32} />,
    'martial-arts': <MaterialIcons name="sports-martial-arts" color="#fff" size={32} />,
    dance: <MaterialIcons name="audiotrack" color="#fff" size={32} />,
    cricket: <MaterialIcons name="sports-cricket" color="#fff" size={32} />,
    football: <MaterialIcons name="sports-soccer" color="#fff" size={32} />,
    tennis: <MaterialIcons name="sports-tennis" color="#fff" size={32} />,
    basketball: <MaterialIcons name="sports-basketball" color="#fff" size={32} />,
    running: <MaterialIcons name="directions-run" color="#fff" size={32} />,
    cycling: <MaterialIcons name="directions-bike" color="#fff" size={32} />,
    golf: <MaterialIcons name="sports-golf" color="#fff" size={32} />,
    nutrition: <MaterialIcons name="restaurant" color="#fff" size={32} />,
    meditation: <MaterialIcons name="spa" color="#fff" size={32} />,
    physiotherapy: <MaterialIcons name="healing" color="#fff" size={32} />,
    fitness: <MaterialIcons name="fitness-center" color="#fff" size={32} />,
    sports: <MaterialIcons name="emoji-events" color="#fff" size={32} />,
  };

  const catGradients: any = {
    gym: ['#2C3E50', '#000000'],
    yoga: ['#4A235A', '#150620'],
    swimming: ['#1B4F72', '#061D2E'],
    badminton: ['#0E6251', '#031E18'],
    'martial-arts': ['#78281F', '#240A07'],
    dance: ['#512E5F', '#190C1F'],
    cricket: ['#7E5109', '#2C1B02'],
    football: ['#154360', '#041520'],
    tennis: ['#186A3B', '#052211'],
    basketball: ['#873600', '#301100'],
    running: ['#0B5345', '#021B16'],
    cycling: ['#422953', '#17081D'],
    golf: ['#1D8348', '#072E18'],
    nutrition: ['#7D6608', '#2A2101'],
    meditation: ['#0E6655', '#03201A'],
    physiotherapy: ['#641E16', '#1E0603'],
    fitness: ['#1A5276', '#061722'],
    sports: ['#9A7D0A', '#2D2302'],
  };
  
  const trainerBgColors = ['#1A1A1A', '#222222', '#141414', '#1E1E1E', '#2A2A2A', '#111111'];

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C9B07D" />}
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
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(user)/(tabs)/search', params: { category: cat.slug } })}
            >
              <LinearGradient
                colors={catGradients[cat.slug] || ['#FF8A65', '#C9B07D']}
                style={styles.categoryBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.categoryIconCircle}>
                  {catIcons[cat.slug] || <MaterialIcons name="sports" color="#fff" size={32} />}
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </LinearGradient>
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
            const bgColor = trainerBgColors[index % trainerBgColors.length];
            return (
              <FeaturedTrainerCard 
                key={trainer._id} 
                trainer={trainer} 
                bgColor={bgColor} 
                onPress={() => router.push({ pathname: '/(user)/trainer/[id]', params: { id: trainer._id } })}
              />
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
  welcomeText: { color: '#A1A1AA', fontSize: 12, marginBottom: 8 },
  welcomeName: { color: '#C9B07D', fontWeight: '700' },
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
  searchIcon: { fontSize: 12, marginRight: 12, opacity: 0.7 },
  searchPlaceholder: { color: '#777', fontSize: 12 },

  quoteContainer: {
    marginTop: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#C9B07D',
  },
  quoteLabel: { color: '#C9B07D', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  quoteText: { color: '#E0E0E0', fontSize: 12, fontStyle: 'italic', lineHeight: 22 },

  statsWrapper: {
    marginTop: 10,
    marginBottom: 10,
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
  statNumber: { color: '#fff', fontSize: 12, fontWeight: '700' },
  statLabel: { color: '#777', fontSize: 12, marginTop: 4 },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: isWeb ? 'auto' : width - 40,
    marginTop: 16,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  activeDot: { backgroundColor: '#C9B07D', width: 24 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  seeAllText: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },

  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryBox: {
    width: 110,
    height: 120,
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },

  featuredContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  featuredCard: {
    width: width > 768 ? '48%' : '100%',
    height: 180,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF9800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  premiumText: { color: '#fff', fontSize: 8, fontWeight: '800' },
  featuredCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  featuredInitials: {
    color: '#fff',
    fontSize: 66,
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
  featuredName: { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  featuredRating: { color: '#fff', fontSize: 12, opacity: 0.9 },
  featuredPrice: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
