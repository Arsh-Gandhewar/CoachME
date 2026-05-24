import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform, Image } from 'react-native';
import { useAuthStore } from '../../../store/authStore';

export default function TrainerProfileScreen() {
  const { user, logout } = useAuthStore();
  const trainer = user as any;
  const initials = (trainer?.fullName || 'T').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {trainer?.profilePhoto ? (
          <Image source={{ uri: trainer.profilePhoto }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        )}
        <Text style={styles.name}>{trainer?.fullName || 'Trainer'}</Text>
        <Text style={styles.email}>{trainer?.email || ''}</Text>
        <View style={styles.statRow}>
          <View style={styles.stat}><Text style={styles.statVal}>⭐ {trainer?.rating || 0}</Text><Text style={styles.statLbl}>Rating</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>{trainer?.experience || 0}yr</Text><Text style={styles.statLbl}>Exp</Text></View>
          <View style={styles.stat}><Text style={styles.statVal}>₹{trainer?.pricing || 0}</Text><Text style={styles.statLbl}>Price</Text></View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specializations</Text>
        <View style={styles.tags}>
          {trainer?.specializations?.map((s: string, i: number) => (
            <View key={i} style={styles.tag}><Text style={styles.tagText}>{s}</Text></View>
          ))}
        </View>
      </View>

      {trainer?.portfolioImages && trainer.portfolioImages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.portfolioScroll}>
            {trainer.portfolioImages.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
            ))}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }])}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { alignItems: 'center', paddingTop: Platform.OS === 'web' ? 40 : 50, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#7C4DFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarImage: { width: 80, height: 80, borderRadius: 24, marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 12, fontWeight: '700', color: '#fff' },
  email: { fontSize: 12, color: '#A1A1AA', marginTop: 4 },
  statRow: { flexDirection: 'row', marginTop: 20, gap: 20 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 12, fontWeight: '700', color: '#fff' },
  statLbl: { fontSize: 12, color: '#A1A1AA', marginTop: 2 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#141414' },
  tagText: { color: '#fff', fontSize: 12 },
  portfolioScroll: { flexDirection: 'row', marginTop: 8 },
  portfolioImg: { width: 120, height: 120, borderRadius: 16, marginRight: 12 },
  logoutBtn: { marginHorizontal: 20, marginTop: 30, backgroundColor: '#0A0A0A', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(157,0,255,0.2)' },
  logoutText: { color: '#F44336', fontSize: 12, fontWeight: '600' },
});
