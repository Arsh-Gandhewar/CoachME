import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { chatAPI } from '../../../services/endpoints';
import { Chat } from '../../../types';

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await chatAPI.getChats();
        setChats(res.data.data || []);
      } catch {}
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={chats}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: '/(user)/chat/[id]' as any, params: { id: item._id } })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>💬</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>Chat</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage?.text || 'No messages yet'}</Text>
            </View>
            <Text style={styles.time}>{item.lastMessage?.timestamp ? new Date(item.lastMessage.timestamp).toLocaleDateString() : ''}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyDesc}>Start a conversation by visiting a trainer's profile</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', paddingTop: Platform.OS === 'web' ? 40 : 50 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', paddingHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20 },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 12 },
  chatInfo: { flex: 1, marginLeft: 12 },
  chatName: { color: '#fff', fontSize: 12, fontWeight: '600' },
  lastMsg: { color: '#A1A1AA', fontSize: 12, marginTop: 2 },
  time: { color: '#666', fontSize: 12 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 12, fontWeight: '600' },
  emptyDesc: { color: '#666', fontSize: 12, marginTop: 4, textAlign: 'center' },
});
