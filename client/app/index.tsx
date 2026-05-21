import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'trainer') {
    return <Redirect href="/(trainer)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(user)/(tabs)/home" />;
}
