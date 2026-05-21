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
        tabBarActiveTintColor: '#FF5722',
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
  tabBar: { backgroundColor: '#1a1a1a', borderTopColor: 'rgba(255,255,255,0.06)', borderTopWidth: 1, height: 70, paddingBottom: 10, paddingTop: 6 },
  tabLabel: { fontSize: 11, fontWeight: '500' },
  tabItem: { alignItems: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF5722', marginBottom: 4 },
  icon: { fontSize: 22 },
});
