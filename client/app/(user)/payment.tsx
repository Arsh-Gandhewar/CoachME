import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaymentScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Visa ending in 4242</Text>
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          </View>
          <Text style={styles.expiry}>Expires 12/28</Text>
          <TouchableOpacity style={styles.removeBtn}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Add New Payment Method</Text>
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
  
  content: { padding: 20 },
  
  card: { backgroundColor: '#1E1E1E', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  defaultBadge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  expiry: { color: '#9E9E9E', fontSize: 14, marginBottom: 16 },
  removeBtn: { alignSelf: 'flex-start' },
  removeText: { color: '#F44336', fontSize: 14, fontWeight: '500' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FF5722', borderStyle: 'dashed' },
  addIcon: { color: '#FF5722', fontSize: 24, marginRight: 8, marginTop: -4 },
  addText: { color: '#FF5722', fontSize: 16, fontWeight: '600' },
});
