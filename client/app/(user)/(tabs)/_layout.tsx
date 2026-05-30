import { Tabs } from 'expo-router';
import { Home, Search, CalendarDays, MessageCircle, User } from 'lucide-react-native';
import TabBar from '../../../components/TabBar';

const tabs = [
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'search', icon: Search, label: 'Explore' },
  { name: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { name: 'chat', icon: MessageCircle, label: 'Chat' },
  { name: 'profile', icon: User, label: 'Profile' },
];

export default function UserTabs() {
  return (
    <Tabs
      tabBar={(props) => {
        const activeTab = props.state.routes[props.state.index]?.name || 'home';
        return (
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={(name) => {
              const route = props.state.routes.find((r: any) => r.name === name);
              if (route) {
                const event = props.navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!event.defaultPrevented) props.navigation.navigate(name);
              }
            }}
          />
        );
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Explore' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
