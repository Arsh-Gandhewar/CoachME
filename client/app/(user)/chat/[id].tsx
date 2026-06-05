import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { chatAPI } from '../../../services/endpoints';
import { useAuthStore } from '../../../store/authStore';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import Header from '../../../components/Header';
import EmptyState from '../../../components/EmptyState';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      } catch (err) { console.error('Failed to load chat', err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      const res = await chatAPI.sendMessage(id, inputText.trim());
      setMessages([...messages, res.data.data]);
      setInputText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) { console.error('Failed to send message', err); }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
        <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title={otherParticipant?.name || otherParticipant?.fullName || 'Chat'} onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/chat')} />
      <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
        ref={flatListRef} data={messages} renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={!loading ? (
          <EmptyState icon={<Text style={{ fontSize: 40 }}>👋</Text>} title="Say hi!" subtitle="Send a message to start the conversation" />
        ) : null}
      />
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TextInput style={styles.input} value={inputText} onChangeText={setInputText} placeholder="Type a message..." placeholderTextColor={theme.text.muted} multiline onSubmitEditing={sendMessage} />
        <TouchableOpacity style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} onPress={sendMessage} disabled={!inputText.trim()}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  messageList: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  messageBubble: { maxWidth: '80%', padding: spacing.md, borderRadius: radius.xl, marginBottom: spacing.md },
  myMessage: { backgroundColor: theme.accent.purple, alignSelf: 'flex-end', borderBottomRightRadius: radius.xs },
  theirMessage: { backgroundColor: theme.bg.card, alignSelf: 'flex-start', borderBottomLeftRadius: radius.xs, borderWidth: 1, borderColor: theme.border.subtle },
  messageText: { ...typography.body, lineHeight: 20 },
  myText: { color: '#FFFFFF' },
  theirText: { color: theme.text.primary },
  timeText: { ...typography.micro, alignSelf: 'flex-end', marginTop: spacing.xs },
  myTime: { color: 'rgba(255,255,255,0.6)' },
  theirTime: { color: theme.text.muted },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: spacing.lg, backgroundColor: theme.bg.secondary, borderTopWidth: 1, borderTopColor: theme.border.subtle },
  input: { flex: 1, backgroundColor: theme.bg.input, color: theme.text.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md, ...typography.body, maxHeight: 100, minHeight: 40, borderWidth: 1, borderColor: theme.border.subtle, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  sendBtn: { marginLeft: spacing.md, width: 44, height: 44, borderRadius: radius.full, backgroundColor: theme.accent.purple, justifyContent: 'center', alignItems: 'center' },
});
