import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const icons: Record<string, string> = { home: '🏠', search: '🔍', bookings: '📅', chat: '💬', profile: '👤' };
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.dot} />}
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.5 }]}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function UserTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#C9B07D',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ focused, color }) => <TabIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Explore', tabBarIcon: ({ focused, color }) => <TabIcon name="search" color={color} focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ focused, color }) => <TabIcon name="bookings" color={color} focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ focused, color }) => <TabIcon name="chat" color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused, color }) => <TabIcon name="profile" color={color} focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#0A0A0A', borderTopColor: 'rgba(255,255,255,0.04)', borderTopWidth: 1, height: 70, paddingBottom: 10, paddingTop: 6 },
  tabLabel: { fontSize: 12, fontWeight: '500' },
  tabItem: { alignItems: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9B07D', marginBottom: 4 },
  icon: { fontSize: 20 },
});
