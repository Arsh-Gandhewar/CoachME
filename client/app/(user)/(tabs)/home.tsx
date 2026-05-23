import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Dimensions, Platform, Image, Animated } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const portfolioImages = trainer.portfolioImages || [];

  useEffect(() => {
    if (portfolioImages.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0.2,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setActiveImageIndex((prev) => (prev + 1) % portfolioImages.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // Slowed down from 3000 to 5000
    return () => clearInterval(interval);
  }, [portfolioImages.length, fadeAnim]);

  const initials = trainer.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <TouchableOpacity 
      style={[styles.featuredCard, { padding: 0, backgroundColor: '#1E1E1E' }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* TOP 65%: Image Gallery */}
      <View style={{ height: '65%', width: '100%', position: 'relative' }}>
        {portfolioImages.length > 0 ? (
          <Animated.Image 
            source={{ uri: portfolioImages[activeImageIndex] }} 
            style={{ ...StyleSheet.absoluteFillObject, resizeMode: 'cover', opacity: fadeAnim }}
          />
        ) : (
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500&auto=format&fit=crop' }} 
            style={{ ...StyleSheet.absoluteFillObject, resizeMode: 'cover' }}
          />
        )}

        {/* Premium Badge Top Right */}
        {trainer.premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>★ PREMIUM</Text>
          </View>
        )}

        {/* Image Gallery Dots (Bottom center of top section) */}
        {portfolioImages.length > 1 && (
          <View style={{ flexDirection: 'row', position: 'absolute', bottom: 10, alignSelf: 'center', gap: 4 }}>
            {portfolioImages.map((_, idx) => (
              <View key={idx} style={{ width: idx === activeImageIndex ? 12 : 4, height: 4, borderRadius: 2, backgroundColor: idx === activeImageIndex ? '#C9B07D' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </View>
        )}
      </View>

      {/* BOTTOM 35%: Profile Info */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        
        {/* Profile Image */}
        <View style={styles.featuredProfileWrap}>
          {trainer.profilePhoto || trainer.profileImage ? (
            <Image 
              source={{ uri: trainer.profilePhoto || trainer.profileImage }} 
              style={styles.featuredProfileImg}
            />
          ) : (
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{initials}</Text>
          )}
        </View>
        
        {/* Name, Category, Exp */}
        <View style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}>
          <Text style={styles.featuredName} numberOfLines={1}>{trainer.fullName} {trainer.verified ? '✓' : ''}</Text>
          <Text style={{ color: '#C9B07D', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
            {trainer.category} • {trainer.experience || 0} YRS EXP
          </Text>
        </View>

        {/* Price and Rating */}
        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
          <Text style={styles.featuredPrice}>₹{trainer.pricing}</Text>
          <Text style={[styles.featuredRating, { marginTop: 2 }]}>⭐ {trainer.rating}</Text>
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

  useEffect(() => { 
    fetchData(); 
    
    // Update quote occasionally without reloading
    const interval = setInterval(() => {
      setTodayQuote(getLocalQuote());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

          {/* User Dashboard */}
          <View style={styles.dashboardContainer}>
            <Text style={styles.dashboardTitle}>Your Dashboard</Text>

            <View style={styles.statsRow}>
              {stats.map((stat, idx) => (
                <View key={idx} style={styles.statMiniCard}>
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 20, style: { marginBottom: 6 } })}
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.quoteCard}>
              <Text style={styles.quoteLabel}>💡 Today's Motivation</Text>
              <Text style={styles.quoteText}>"{todayQuote}"</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <TouchableOpacity onPress={() => router.push('/(user)/(tabs)/search')}>
            <Text style={styles.seeAllText}>See all {'>'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginHorizontal: -20 }}
          contentContainerStyle={[styles.categoriesContainer, { paddingHorizontal: 20 }]}
        >
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
    paddingTop: Platform.OS === 'web' ? 40 : 50,
    paddingBottom: 12,
  },
  welcomeText: { color: '#A1A1AA', fontSize: 12, marginBottom: 4 },
  welcomeName: { color: '#C9B07D', fontWeight: '700' },
  heroTitle: { color: '#ffffff', fontSize: 48, fontWeight: '800', marginBottom: 16, letterSpacing: -1 },
  
  dashboardContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dashboardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.03)',
  },
  statNumber: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statLabel: { color: '#A1A1AA', fontSize: 10, marginTop: 4, textAlign: 'center' },
  
  quoteCard: {
    backgroundColor: 'rgba(201, 176, 125, 0.05)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#C9B07D',
  },
  quoteLabel: { color: '#C9B07D', fontSize: 10, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  quoteText: { color: '#E0E0E0', fontSize: 11, fontStyle: 'italic', lineHeight: 18 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  seeAllText: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },

  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryBox: {
    width: 90,
    height: 100,
    borderRadius: 16,
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: { color: '#fff', fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },

  featuredContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  featuredCard: {
    width: width > 768 ? '48%' : '100%',
    height: 200,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  premiumText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  featuredProfileWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#C9B07D',
    overflow: 'hidden',
  },
  featuredProfileImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredName: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  featuredRating: { color: '#A1A1AA', fontSize: 11, fontWeight: '600' },
  featuredPrice: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
