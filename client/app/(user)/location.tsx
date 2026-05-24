import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';

export default function LocationScreen() {
  const router = useRouter();
  
  const [preciseLocation, setPreciseLocation] = useState(true);
  const [backgroundLocation, setBackgroundLocation] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Location Services</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <View>
                <Text style={styles.itemLabel}>Precise Location</Text>
                <Text style={styles.itemDesc}>Required to find trainers near you</Text>
              </View>
              <Switch 
                value={preciseLocation} 
                onValueChange={setPreciseLocation}
                trackColor={{ false: '#333', true: '#9D00FF' }}
              />
            </View>
            <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.itemLabel}>Background Location</Text>
                <Text style={styles.itemDesc}>Update your location constantly</Text>
              </View>
              <Switch 
                value={backgroundLocation} 
                onValueChange={setBackgroundLocation}
                trackColor={{ false: '#333', true: '#9D00FF' }}
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
  backText: { color: '#A1A1AA', fontSize: 12 },
  title: { color: '#fff', fontSize: 12, fontWeight: '700' },
  
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  
  card: { backgroundColor: '#0A0A0A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemLabel: { color: '#fff', fontSize: 12, marginBottom: 4 },
  itemDesc: { color: '#777', fontSize: 12 },
});
