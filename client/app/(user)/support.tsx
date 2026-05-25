import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { HelpCircle, MessageCircle, Mail } from 'lucide-react-native';

export default function SupportScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}
        >
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>


        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow} onPress={() => router.push('/(user)/support-chat')}>
            <View style={styles.itemLeft}>
              <MessageCircle color="#B388FF" size={24} />
              <View style={styles.itemText}>
                <Text style={styles.itemLabel}>Live AI Support</Text>
                <Text style={styles.itemDesc}>Instant answers to your queries</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.itemRow, { borderBottomWidth: 0 }]}>
            <View style={styles.itemLeft}>
              <Mail color="#B388FF" size={24} />
              <View style={styles.itemText}>
                <Text style={styles.itemLabel}>Email Support</Text>
                <Text style={styles.itemDesc}>support@trainersapp.com</Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>FAQ</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemLabel}>How do I cancel a booking?</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemRow}>
            <Text style={styles.itemLabel}>How do payments work?</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.itemRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.itemLabel}>Refund policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
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

  sectionTitle: { color: '#A1A1AA', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 },
  
  card: { backgroundColor: '#0A0A0A', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 32 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemText: { marginLeft: 16 },
  itemLabel: { color: '#fff', fontSize: 12, marginBottom: 4 },
  itemDesc: { color: '#777', fontSize: 12 },
  chevron: { color: '#666', fontSize: 12, marginTop: -2 },
});
