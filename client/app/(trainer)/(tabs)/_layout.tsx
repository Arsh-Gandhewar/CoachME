import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = { dashboard: '📊', bookings: '📅', profile: '👤' };
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.dot} />}
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function TrainerTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: '#FF5722', tabBarInactiveTintColor: '#666', tabBarLabelStyle: styles.tabLabel }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ focused }) => <TabIcon name="bookings" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#1a1a1a', borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1, height: 70, paddingBottom: 10, paddingTop: 6 },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  tabItem: { alignItems: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF5722', marginBottom: 4 },
});
