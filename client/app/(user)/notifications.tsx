import { useState } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { userAPI } from '../../services/endpoints';
import { registerForPushNotificationsAsync } from '../../utils/pushNotifications';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const prefs = (user as any)?.notificationPreferences || {};
  
  const [pushEnabled, setPushEnabled] = useState(prefs.pushEnabled !== false);
  const [emailEnabled, setEmailEnabled] = useState(prefs.emailEnabled !== false);
  const [smsEnabled, setSmsEnabled] = useState(prefs.smsEnabled === true);
  const [bookingUpdates, setBookingUpdates] = useState(prefs.bookingUpdates !== false);
  const [newMessages, setNewMessages] = useState(prefs.newMessages !== false);
  const [promotions, setPromotions] = useState(prefs.promotions === true);

  const handleToggle = async (key: string, value: boolean, setter: any) => {
    setter(value);
    let fcmToken = (user as any)?.fcmToken;
    if (key === 'pushEnabled' && value === true) {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        if (Platform.OS === 'web') window.alert('Failed to get push token.');
        else Alert.alert('Permission Required', 'Enable push notifications in device settings.');
        setter(false);
        return;
      }
      fcmToken = token;
    }
    const updatedPrefs = { pushEnabled, emailEnabled, smsEnabled, bookingUpdates, newMessages, promotions, [key]: value };
    try {
      const payload: any = { notificationPreferences: updatedPrefs };
      if (fcmToken) payload.fcmToken = fcmToken;
      const res = await userAPI.updateProfile(payload);
      if (res.data?.data) setUser(res.data.data, 'user');
    } catch (error) {
      console.error('Failed to save notification preference', error);
      setter(!value);
    }
  };

  const toggleItems = [
    { title: 'Channels', items: [
      { label: 'Push Notifications', key: 'pushEnabled', value: pushEnabled, setter: setPushEnabled },
      { label: 'Email Notifications', key: 'emailEnabled', value: emailEnabled, setter: setEmailEnabled },
      { label: 'SMS Notifications', key: 'smsEnabled', value: smsEnabled, setter: setSmsEnabled },
    ]},
    { title: 'Types', items: [
      { label: 'Booking Updates', desc: 'Get notified about session changes', key: 'bookingUpdates', value: bookingUpdates, setter: setBookingUpdates },
      { label: 'New Messages', desc: 'When a trainer messages you', key: 'newMessages', value: newMessages, setter: setNewMessages },
      { label: 'Promotions & Offers', desc: 'Discounts and new features', key: 'promotions', value: promotions, setter: setPromotions },
    ]},
  ];

  return (
    <ScreenWrapper>
      <Header title="Notifications" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      {toggleItems.map((section, sIdx) => (
        <Animated.View key={sIdx} entering={FadeInDown.duration(400).delay(100 + sIdx * 150)}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={{ padding: 0, marginBottom: spacing.xl }}>
            {section.items.map((item: any, i) => (
              <View key={i} style={[styles.itemRow, i < section.items.length - 1 && styles.itemBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.desc && <Text style={styles.itemDesc}>{item.desc}</Text>}
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(val) => handleToggle(item.key, val, item.setter)}
                  trackColor={{ false: theme.bg.hover, true: theme.accent.purple }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </Card>
        </Animated.View>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.label, color: theme.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, paddingLeft: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  itemLabel: { ...typography.body, color: theme.text.primary, marginBottom: spacing.xs },
  itemDesc: { ...typography.caption, color: theme.text.muted },
});
