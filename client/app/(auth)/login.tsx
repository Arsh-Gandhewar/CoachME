import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      // After successful login, the AuthGate in _layout.tsx handles redirect.
      // But on web, we also do an explicit push as a fallback.
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
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isWeb && { alignItems: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, isWeb && { maxWidth: 420, width: '100%' }]}>
          <View style={styles.header}>
            <Text style={styles.logo}>
              Coach<Text style={styles.logoAccent}>ME</Text>
            </Text>
            <Text style={styles.subtitle}>Discover & book the best trainers near you</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.desc}>Sign in to your account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, paddingRight: 60 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.link}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.testCreds}>Test: rohit@test.com / User@123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  inner: { width: '100%' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 38, fontWeight: '800', color: '#fff' },
  logoAccent: { color: '#C9B07D' },
  subtitle: { fontSize: 12, color: '#A1A1AA', marginTop: 8, textAlign: 'center' },
  form: { backgroundColor: '#0A0A0A', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  title: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 4 },
  desc: { fontSize: 12, color: '#A1A1AA', marginBottom: 24 },
  errorBox: { backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(244,67,54,0.3)' },
  errorText: { color: '#F44336', fontSize: 12, fontWeight: '500' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#A1A1AA', marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: '#141414', borderRadius: 12, padding: 14, fontSize: 12, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeText: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },
  forgot: { color: '#C9B07D', fontSize: 12, textAlign: 'right', marginBottom: 20, fontWeight: '500' },
  btn: { backgroundColor: '#C9B07D', borderRadius: 14, padding: 16, alignItems: 'center', ...Platform.select({ web: { cursor: 'pointer' as any }, default: {} }) },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#A1A1AA', fontSize: 12 },
  link: { color: '#C9B07D', fontSize: 12, fontWeight: '600' },
  testCreds: { color: '#616161', fontSize: 12, textAlign: 'center', marginTop: 20 },
});
