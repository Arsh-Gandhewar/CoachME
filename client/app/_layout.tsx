import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 5 * 60 * 1000 },
  },
});

function AuthGate() {
  const { isAuthenticated, isLoading, role, loadStoredAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTrainerGroup = segments[0] === '(trainer)';
    const inUserGroup = segments[0] === '(user)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (inAuthGroup) {
        if (role === 'trainer') {
          router.replace('/(trainer)/(tabs)/dashboard');
        } else {
          router.replace('/(user)/(tabs)/home');
        }
      } else if (role === 'trainer' && inUserGroup) {
        router.replace('/(trainer)/(tabs)/dashboard');
      } else if (role !== 'trainer' && inTrainerGroup) {
        router.replace('/(user)/(tabs)/home');
      }
    }
  }, [isAuthenticated, isLoading, segments, role]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGate />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
});
