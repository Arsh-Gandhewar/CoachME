import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../../services/endpoints';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch { Alert.alert('Error', 'Something went wrong'); }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/(auth)/login')} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.desc}>Enter your email to receive a password reset link</Text>
      {!sent ? (
        <>
          <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={styles.btn} onPress={handleSend}>
            <Text style={styles.btnText}>Send Reset Link</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.success}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successText}>Reset link sent! Check your email (or server console in dev mode).</Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.canGoBack() ? router.back() : router.push('/(auth)/login')}>
            <Text style={styles.btnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 24, justifyContent: 'center' },
  back: { position: 'absolute', top: 60, left: 24 },
  backText: { color: '#FF5722', fontSize: 16, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  desc: { fontSize: 14, color: '#9E9E9E', marginBottom: 30 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 20 },
  btn: { backgroundColor: '#FF5722', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  success: { alignItems: 'center' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successText: { color: '#9E9E9E', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
});
