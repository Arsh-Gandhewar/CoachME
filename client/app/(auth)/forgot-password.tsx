import { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Mail, CheckCircle } from 'lucide-react-native';
import { authAPI } from '../../services/endpoints';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) {
      if (Platform.OS === 'web') window.alert('Please enter your email');
      else Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      if (Platform.OS === 'web') window.alert('Something went wrong');
      else Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Forgot Password"
        onBack={() => router.canGoBack() ? router.back() : router.push('/(auth)/login')}
      />

      <View style={styles.content}>
        {!sent ? (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.desc}>
              Enter the email address associated with your account and we'll send you a reset link.
            </Text>

            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={theme.text.muted} />}
            />

            <View style={{ height: spacing['2xl'] }} />

            <Button
              title="Send Reset Link"
              onPress={handleSend}
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={48} color={theme.status.success} />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We've sent a password reset link to {email}. Check your inbox (or server console in dev mode).
            </Text>

            <Button
              title="Back to Login"
              onPress={() => router.canGoBack() ? router.back() : router.push('/(auth)/login')}
              fullWidth
            />
          </Animated.View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', paddingBottom: spacing['6xl'] },
  title: { ...typography.h1, color: theme.text.primary, marginBottom: spacing.sm },
  desc: { ...typography.body, color: theme.text.secondary, marginBottom: spacing['3xl'], lineHeight: 22 },
  successContainer: { alignItems: 'center' },
  successIcon: { marginBottom: spacing['2xl'] },
  successTitle: { ...typography.h2, color: theme.text.primary, marginBottom: spacing.md },
  successText: { ...typography.body, color: theme.text.secondary, textAlign: 'center', marginBottom: spacing['3xl'], lineHeight: 22, paddingHorizontal: spacing.lg },
});
