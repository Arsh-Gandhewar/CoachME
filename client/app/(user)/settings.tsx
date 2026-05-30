import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { User, Bell, Shield, MapPin, Smartphone, Mail, Key, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleDelete = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        window.alert('Account deletion requested. Please contact support.');
      }
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <User color={theme.text.secondary} size={20} />, label: 'Personal Information', value: '', action: () => router.push('/(user)/edit-profile') },
        { icon: <Mail color={theme.text.secondary} size={20} />, label: 'Email', value: (user as any)?.email || '', action: () => router.push('/(user)/edit-profile') },
        { icon: <Smartphone color={theme.text.secondary} size={20} />, label: 'Phone', value: (user as any)?.mobile || 'Not set', action: () => router.push('/(user)/edit-profile') },
        { icon: <Key color={theme.text.secondary} size={20} />, label: 'Change Password', value: '', action: () => router.push('/(user)/change-password') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell color={theme.text.secondary} size={20} />, label: 'Notifications', value: '', action: () => router.push('/(user)/notifications') },
        { icon: <MapPin color={theme.text.secondary} size={20} />, label: 'Location', value: '', action: () => router.push('/(user)/location') },
      ]
    },
    {
      title: 'Legal',
      items: [
        { icon: <Shield color={theme.text.secondary} size={20} />, label: 'Privacy Policy', value: '', action: () => router.push('/(user)/privacy-policy') },
        { icon: <Shield color={theme.text.secondary} size={20} />, label: 'Terms of Service', value: '', action: () => router.push('/(user)/terms-of-service') },
      ]
    }
  ];

  return (
    <ScreenWrapper>
      <Header title="Settings" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      {sections.map((section, sIdx) => (
        <Animated.View key={sIdx} entering={FadeInDown.duration(400).delay(100 + sIdx * 100)}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={{ padding: 0, marginBottom: spacing.xl }}>
            {section.items.map((item, i) => (
              <TouchableOpacity key={i} style={[styles.itemRow, i < section.items.length - 1 && styles.itemBorder]} onPress={item.action} activeOpacity={0.7}>
                <View style={styles.itemLeft}>
                  <View style={styles.iconWrap}>{item.icon}</View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <View style={styles.itemRight}>
                  {!!item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                  <ChevronRight size={18} color={theme.text.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.duration(400).delay(500)}>
        <Button title="Delete Account" variant="danger" onPress={handleDelete} fullWidth />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.label, color: theme.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, paddingLeft: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: theme.bg.input, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  itemLabel: { ...typography.body, color: theme.text.primary },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemValue: { ...typography.bodySmall, color: theme.text.muted, maxWidth: 140 },
});
