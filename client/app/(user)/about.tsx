import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏋️</Text>
          <Text style={styles.logoText}>Trainers<Text style={styles.logoAccent}>App</Text></Text>
          <Text style={styles.version}>Version 1.0.0 (Build 42)</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={() => router.push('/(user)/terms-of-service')}>
            <Text style={styles.itemLabel}>Terms of Service</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.itemRow, { borderBottomWidth: 0 }]} onPress={() => router.push('/(user)/privacy-policy')}>
            <Text style={styles.itemLabel}>Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2026 TrainersApp Inc. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  content: { padding: 20 },
  logoContainer: { alignItems: 'center', marginVertical: 40 },
  logoIcon: { fontSize: 64, marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  logoAccent: { color: '#FF5722' },
  version: { color: '#777', marginTop: 8 },

  card: { backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemLabel: { color: '#fff', fontSize: 16 },
  chevron: { color: '#666', fontSize: 22, marginTop: -2 },

  copyright: { color: '#666', textAlign: 'center', fontSize: 12 },
});
