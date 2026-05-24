import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chatAPI } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/authStore';
import { Chat } from '../../../types';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // receiverId
  const router = useRouter();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await chatAPI.getChatByReceiver(id);
        const chat = res.data.data;
        setMessages(chat.messages || []);
        setOtherParticipant(chat.otherParticipant);
      } catch (err) {
        console.error('Failed to load chat', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      const res = await chatAPI.sendMessage(id, inputText.trim());
      setMessages([...messages, res.data.data]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
        <Text style={styles.timeText}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/chat')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherParticipant?.name || otherParticipant?.fullName || 'Loading...'}</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👋</Text>
              <Text style={styles.emptyText}>Say hi!</Text>
            </View>
          ) : null
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!inputText.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: '#0A0A0A' },
  backBtn: { width: 60 },
  backText: { color: '#9D00FF', fontSize: 12, fontWeight: '600' },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  
  messageList: { padding: 16, paddingBottom: 32 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  myMessage: { backgroundColor: '#9D00FF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirMessage: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  messageText: { fontSize: 12, lineHeight: 18 },
  myMessageText: { color: '#000', fontWeight: '500' },
  theirMessageText: { color: '#fff' },
  timeText: { fontSize: 9, color: 'rgba(0,0,0,0.5)', alignSelf: 'flex-end', marginTop: 4 },
  
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: '#666', fontSize: 12 },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  input: { flex: 1, backgroundColor: '#141414', color: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 12, maxHeight: 100, minHeight: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  sendBtn: { marginLeft: 12, backgroundColor: '#9D00FF', borderRadius: 20, paddingHorizontal: 20, height: 40, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#000', fontSize: 12, fontWeight: '700' },
});
