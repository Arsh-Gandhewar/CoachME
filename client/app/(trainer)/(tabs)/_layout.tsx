import { Tabs } from 'expo-router';
import { LayoutDashboard, CalendarDays, User } from 'lucide-react-native';
import TabBar from '../../../components/TabBar';

const tabs = [
  { name: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { name: 'bookings', icon: CalendarDays, label: 'Bookings' },
  { name: 'profile', icon: User, label: 'Profile' },
];

export default function TrainerTabs() {
  return (
    <Tabs
      tabBar={(props) => {
        const activeTab = props.state.routes[props.state.index]?.name || 'dashboard';
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
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
