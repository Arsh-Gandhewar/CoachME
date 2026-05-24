import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { bookingAPI, userAPI } from '../../../services/endpoints';
import { Heart, CreditCard, Bell, Settings, HelpCircle, Info, LogOut, User, Edit2 } from 'lucide-react-native';

const isWeb = Platform.OS === 'web';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const userName = (user as any)?.name || (user as any)?.fullName || 'User';
  const profileImage = (user as any)?.profileImage || (user as any)?.profilePhoto || null;
  const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    if (isWeb) {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
        router.replace('/(auth)/login');
      }
    } else {
      logout();
      router.replace('/(auth)/login');
    }
  };

  const menuItems = [
    { icon: <User color="#A1A1AA" size={20} />, label: 'Edit Profile', action: () => router.push('/(user)/edit-profile') },
    { icon: <Heart color="#A1A1AA" size={20} />, label: 'Favorites', action: () => router.push('/(user)/favorites') },
    { icon: <Settings color="#A1A1AA" size={20} />, label: 'Settings', action: () => router.push('/(user)/settings') },
    { icon: <HelpCircle color="#A1A1AA" size={20} />, label: 'Help & Support', action: () => router.push('/(user)/support') },
    { icon: <Info color="#A1A1AA" size={20} />, label: 'About', action: () => router.push('/(user)/about') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentWrapper}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarIcon}>👤</Text>
            )}
          </View>
          <Text style={styles.name}>{userName.toUpperCase()}</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={item.action}>
              <View style={styles.menuIcon}>{item.icon}</View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuIcon}>
              <LogOut color="#F44336" size={20} />
            </View>
            <Text style={[styles.menuLabel, { color: '#F44336' }]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  scrollContent: { paddingBottom: 100, alignItems: isWeb ? 'center' : 'stretch' },
  contentWrapper: { width: '100%', maxWidth: 800, paddingHorizontal: 20 },
  
  pageTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 50,
    marginBottom: 20,
  },

  header: { alignItems: 'center', marginBottom: 20 },
  avatarLarge: { 
    width: 80, 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  avatarIcon: { fontSize: 50 },
  name: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 1 },
  
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statLabel: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 4,
  },

  menu: { 
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuIcon: { 
    width: 24,
    alignItems: 'center',
    marginRight: 16 
  },
  menuLabel: { 
    fontSize: 12, 
    color: '#E0E0E0', 
    fontWeight: '400' 
  },
});
