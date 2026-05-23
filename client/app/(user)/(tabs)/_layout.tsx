import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const icons: Record<string, any> = { 
    home: 'home', 
    search: 'search', 
    bookings: 'calendar', 
    chat: 'message-square', 
    profile: 'user' 
  };
  
  const iconName = icons[name] || 'circle';
  const color = focused ? '#C9B07D' : isHovered ? '#FFFFFF' : '#555555';

  return (
    <View 
      style={[
        styles.tabItem, 
        { transform: [{ scale: isHovered ? 1.15 : 1 }] }
      ]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } : {})}
    >
      <Feather 
        name={iconName} 
        size={22} 
        color={color} 
        style={[
          focused ? styles.iconGlow : undefined,
          isHovered && !focused ? styles.iconHoverGlow : undefined
        ]} 
      />
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
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'HOME', tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} /> }} />
      <Tabs.Screen name="search" options={{ title: 'EXPLORE', tabBarIcon: ({ focused }) => <TabIcon name="search" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'BOOKINGS', tabBarIcon: ({ focused }) => <TabIcon name="bookings" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'CHAT', tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'PROFILE', tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { 
    backgroundColor: '#000000', 
    borderTopColor: 'rgba(255,255,255,0.02)', 
    borderTopWidth: 1, 
    height: 75, 
    paddingBottom: 15, 
    paddingTop: 10 
  },
  tabLabel: { 
    fontSize: 9, 
    fontWeight: '800', 
    letterSpacing: 1.2, 
    marginTop: 4 
  },
  tabItem: { 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconGlow: {
    textShadowColor: 'rgba(201, 176, 125, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  iconHoverGlow: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }
});
