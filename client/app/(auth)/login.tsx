import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mail, Lock } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().role;
      if (role === 'trainer') {
        router.replace('/(trainer)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, isWeb && { alignItems: 'center' as const }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, isWeb && { maxWidth: 420, width: '100%' }]}>
          {/* Logo */}
          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.header}>
            <Text style={styles.logo}>
              Coach<Text style={styles.logoAccent}>ME</Text>
            </Text>
            <Text style={styles.subtitle}>Discover & book the best trainers near you</Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInDown.duration(500).delay(250)} style={styles.form}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.desc}>Sign in to your account</Text>

            {error ? (
              <Animated.View entering={FadeInDown.duration(300)} style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </Animated.View>
            ) : null}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={theme.text.muted} />}
            />

            <View style={{ height: spacing.lg }} />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry
              icon={<Lock size={18} color={theme.text.muted} />}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title={loading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.link}>Register</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing['2xl'], paddingVertical: spacing['4xl'] },
  inner: { width: '100%' },
  header: { alignItems: 'center', marginBottom: spacing['4xl'] },
  logo: { ...typography.hero, fontSize: 38, color: theme.text.primary },
  logoAccent: { color: theme.accent.purple },
  subtitle: { ...typography.bodySmall, color: theme.text.secondary, marginTop: spacing.sm, textAlign: 'center' },
  form: { backgroundColor: theme.bg.card, borderRadius: radius.xl, padding: spacing['2xl'], borderWidth: 1, borderColor: theme.border.subtle },
  title: { ...typography.h2, color: theme.text.primary, marginBottom: spacing.xs },
  desc: { ...typography.bodySmall, color: theme.text.secondary, marginBottom: spacing['2xl'] },
  errorBox: { backgroundColor: theme.status.errorLight, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: 'rgba(244,67,54,0.3)' },
  errorText: { color: theme.status.error, ...typography.bodySmall, fontWeight: '500' },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: spacing.xl, marginTop: spacing.sm },
  forgot: { color: theme.accent.purple, ...typography.bodySmall, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: theme.text.secondary, ...typography.body },
  link: { color: theme.accent.purple, ...typography.body, fontWeight: '600' },
});
