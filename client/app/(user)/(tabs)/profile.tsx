import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Heart, Settings, HelpCircle, Info, LogOut, User, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const userName = (user as any)?.name || (user as any)?.fullName || 'User';
  const userEmail = (user as any)?.email || '';
  const profileImage = (user as any)?.profileImage || (user as any)?.profilePhoto || null;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) {
        logout();
        router.replace('/(auth)/login');
      }
    } else {
      logout();
      router.replace('/(auth)/login');
    }
  };

  const menuSections = [
    {
      items: [
        { icon: <User color={theme.text.secondary} size={20} />, label: 'Edit Profile', action: () => router.push('/(user)/edit-profile') },
        { icon: <Heart color={theme.text.secondary} size={20} />, label: 'Favorites', action: () => router.push('/(user)/favorites') },
      ]
    },
    {
      items: [
        { icon: <Settings color={theme.text.secondary} size={20} />, label: 'Settings', action: () => router.push('/(user)/settings') },
        { icon: <HelpCircle color={theme.text.secondary} size={20} />, label: 'Help & Support', action: () => router.push('/(user)/support') },
        { icon: <Info color={theme.text.secondary} size={20} />, label: 'About', action: () => router.push('/(user)/about') },
      ]
    },
  ];

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
        <Avatar uri={profileImage} name={userName} size="xl" />
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </Animated.View>

      {menuSections.map((section, sIdx) => (
        <Animated.View key={sIdx} entering={FadeInDown.duration(400).delay(200 + sIdx * 100)}>
          <Card style={styles.menuCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]} onPress={item.action} activeOpacity={0.7}>
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconWrap}>{item.icon}</View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={theme.text.muted} />
              </TouchableOpacity>
            ))}
          </Card>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.duration(400).delay(450)}>
        <Card style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconWrap}>
                <LogOut color={theme.status.error} size={20} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.status.error }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing['2xl'], marginBottom: spacing['3xl'] },
  name: { ...typography.h2, color: theme.text.primary, marginTop: spacing.lg },
  email: { ...typography.bodySmall, color: theme.text.secondary, marginTop: spacing.xs },
  menuCard: { marginBottom: spacing.lg, padding: 0 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg, paddingHorizontal: spacing.lg },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconWrap: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: theme.bg.input, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  menuLabel: { ...typography.body, color: theme.text.primary },
});
