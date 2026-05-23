import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = { dashboard: '📊', bookings: '📅', profile: '👤' };
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.dot} />}
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function TrainerTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: '#C9B07D', tabBarInactiveTintColor: '#666', tabBarLabelStyle: styles.tabLabel }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ focused }) => <TabIcon name="bookings" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#0A0A0A', borderTopColor: 'rgba(255,255,255,0.04)', borderTopWidth: 1, height: 70, paddingBottom: 10, paddingTop: 6 },
  tabLabel: { fontSize: 12, fontWeight: '500' },
  tabItem: { alignItems: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9B07D', marginBottom: 4 },
});
