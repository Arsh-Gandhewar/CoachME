import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, User, Bell, Shield, MapPin, Smartphone, Mail, Key } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const handleWIP = (feature: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${feature} settings will be available in the next update!`);
    } else {
      Alert.alert('Coming Soon', `${feature} settings will be available in the next update!`);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        window.alert('Account deletion requested. Please contact support.');
      }
    } else {
      Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account deletion requested. Please contact support.') }
      ]);
    }
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: <User color="#9E9E9E" size={20} />, label: 'Personal Information', action: () => router.push('/(user)/edit-profile') },
        { icon: <Mail color="#9E9E9E" size={20} />, label: 'Email Address', value: (user as any)?.email, action: () => router.push('/(user)/edit-profile') },
        { icon: <Smartphone color="#9E9E9E" size={20} />, label: 'Phone Number', value: (user as any)?.mobile || 'Not set', action: () => router.push('/(user)/edit-profile') },
        { icon: <Key color="#9E9E9E" size={20} />, label: 'Change Password', action: () => router.push('/(user)/change-password') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: <Bell color="#9E9E9E" size={20} />, label: 'Push Notifications', value: 'On', action: () => router.push('/(user)/notifications') },
        { icon: <MapPin color="#9E9E9E" size={20} />, label: 'Location Services', value: 'While Using', action: () => router.push('/(user)/location') },
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { icon: <Shield color="#9E9E9E" size={20} />, label: 'Privacy Policy', action: () => router.push('/(user)/privacy-policy') },
        { icon: <Settings color="#9E9E9E" size={20} />, label: 'Terms of Service', action: () => router.push('/(user)/terms-of-service') },
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity 
                  key={itemIdx} 
                  style={[styles.itemRow, itemIdx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={item.action}
                  activeOpacity={item.action ? 0.7 : 1}
                >
                  <View style={styles.itemLeft}>
                    {item.icon}
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    {item.value && (
                      <Text style={[styles.itemValue, item.action && { marginRight: 12 }]}>
                        {item.value}
                      </Text>
                    )}
                    {item.action && <Text style={styles.chevron}>›</Text>}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#9E9E9E', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemLabel: { color: '#fff', fontSize: 16, marginLeft: 16 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemValue: { color: '#9E9E9E', fontSize: 14 },
  chevron: { color: '#666', fontSize: 22, marginTop: -2 },

  deleteBtn: { marginTop: 20, padding: 16, alignItems: 'center' },
  deleteText: { color: '#F44336', fontSize: 16, fontWeight: '600' }
});
