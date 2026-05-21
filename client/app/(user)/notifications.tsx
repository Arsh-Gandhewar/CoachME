import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function NotificationsScreen() {
  const router = useRouter();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Push Notifications</Text>
              <Switch 
                value={pushEnabled} 
                onValueChange={setPushEnabled}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemLabel}>Email Notifications</Text>
              <Switch 
                value={emailEnabled} 
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
            <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.itemLabel}>SMS Notifications</Text>
              <Switch 
                value={smsEnabled} 
                onValueChange={setSmsEnabled}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemLabel}>Booking Updates</Text>
                <Text style={styles.itemDesc}>Get notified about session changes</Text>
              </View>
              <Switch 
                value={bookingUpdates} 
                onValueChange={setBookingUpdates}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemLabel}>New Messages</Text>
                <Text style={styles.itemDesc}>When a trainer messages you</Text>
              </View>
              <Switch 
                value={newMessages} 
                onValueChange={setNewMessages}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
            <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.itemLabel}>Promotions & Offers</Text>
                <Text style={styles.itemDesc}>Discounts and new features</Text>
              </View>
              <Switch 
                value={promotions} 
                onValueChange={setPromotions}
                trackColor={{ false: '#333', true: '#FF5722' }}
              />
            </View>
          </View>
        </View>
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
  
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#9E9E9E', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  
  card: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemLabel: { color: '#fff', fontSize: 16, marginBottom: 4 },
  itemDesc: { color: '#777', fontSize: 13 },
});
