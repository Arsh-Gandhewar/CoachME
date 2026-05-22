import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput 
            style={styles.input} 
            value={currentPassword} 
            onChangeText={setCurrentPassword} 
            secureTextEntry 
            placeholderTextColor="#666" 
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput 
            style={styles.input} 
            value={newPassword} 
            onChangeText={setNewPassword} 
            secureTextEntry 
            placeholderTextColor="#666" 
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput 
            style={styles.input} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            placeholderTextColor="#666" 
          />
        </View>

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  form: { padding: 20, marginTop: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#9E9E9E', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  saveBtn: { backgroundColor: '#FF5722', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
