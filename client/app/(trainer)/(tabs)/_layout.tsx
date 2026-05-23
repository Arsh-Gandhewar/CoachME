import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Feather } from '@expo/vector-icons';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -4, duration: 1500, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
        ])
      ).start();
    } else {
      floatAnim.setValue(0);
    }
  }, [focused]);

  const icons: Record<string, any> = { 
    dashboard: 'pie-chart', 
    bookings: 'calendar', 
    profile: 'user' 
  };
  
  const iconName = icons[name] || 'circle';
  const color = focused ? '#C9B07D' : isHovered ? '#FFFFFF' : '#555555';

  return (
    <Animated.View 
      style={[
        styles.tabItem,
        { transform: [{ scale: isHovered ? 1.15 : 1 }, { translateY: focused ? floatAnim : 0 }] }
      ]}
      {...(Platform.OS === 'web' ? {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      } : {})}
    >
      <Feather 
        name={iconName} 
        size={focused ? 20 : 22} 
        color={color} 
      />
    </Animated.View>
  );
}

function SlidingTabBar({ state, descriptors, navigation }: any) {
  const { width } = Dimensions.get('window');
  const [slideAnim] = useState(new Animated.Value(state.index));

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
  }, [state.index]);

  const tabWidth = width / state.routes.length;

  return (
    <View style={styles.tabBar}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 8,
          left: 0,
          width: tabWidth,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateX: Animated.multiply(slideAnim, tabWidth) }],
          zIndex: 0,
        }}
      >
        <View style={[styles.tabItem, styles.activeTab3D]} />
      </Animated.View>

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={1}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', paddingTop: 8, zIndex: 1 }}
          >
            <TabIcon name={route.name} focused={isFocused} />
            <Text style={[styles.tabLabel, { color: isFocused ? '#C9B07D' : '#555555' }]}>
              {options.title || route.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TrainerTabs() {
  return (
    <Tabs 
      tabBar={(props) => <SlidingTabBar {...props} />}
      screenOptions={{ 
        headerShown: false, 
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'DASHBOARD', tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'BOOKINGS', tabBarIcon: ({ focused }) => <TabIcon name="bookings" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'PROFILE', tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { 
    flexDirection: 'row',
    backgroundColor: '#000000', 
    borderTopColor: 'rgba(255,255,255,0.02)', 
    borderTopWidth: 1, 
    height: Platform.OS === 'ios' ? 70 : 60, 
    paddingBottom: Platform.OS === 'ios' ? 15 : 5, 
    position: 'relative'
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activeTab3D: {
    backgroundColor: '#111111',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(201, 176, 125, 0.4)',
    overflow: 'hidden',
  }
});
