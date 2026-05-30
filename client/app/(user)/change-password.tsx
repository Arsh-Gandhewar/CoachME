import { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock } from 'lucide-react-native';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (Platform.OS === 'web') window.alert('Please fill in all fields');
      else Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') window.alert('New passwords do not match');
      else Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const api = require('../../services/api').default;
      await api.post('/auth/change-password', { currentPassword, newPassword });
      if (Platform.OS === 'web') window.alert('Password updated successfully!');
      else Alert.alert('Success', 'Password updated successfully!');
      router.back();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally { setLoading(false); }
  };

  return (
    <ScreenWrapper>
      <Header title="Change Password" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.form}>
        <Input label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry icon={<Lock size={18} color={theme.text.muted} />} />
        <View style={{ height: spacing.lg }} />
        <Input label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry icon={<Lock size={18} color={theme.text.muted} />} />
        <View style={{ height: spacing.lg }} />
        <Input label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry icon={<Lock size={18} color={theme.text.muted} />} />
        <View style={{ height: spacing['2xl'] }} />
        <Button title={loading ? 'Updating...' : 'Update Password'} onPress={handleSave} loading={loading} disabled={loading} fullWidth />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: spacing.xl },
});
