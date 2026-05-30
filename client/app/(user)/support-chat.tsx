import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supportAPI } from '../../services/endpoints';
import { Send, Bot } from 'lucide-react-native';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import Header from '../../components/Header';

interface Message { id: string; role: 'user' | 'model'; text: string; }

export default function SupportChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hi! I am the CoachME Support Assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const history = messages.filter(m => m.id !== '1').map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await supportAPI.chat({ message: userMessage.text, history });
      const reply = res.data?.data?.reply || "I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally { setLoading(false); }
  };

  useEffect(() => { setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100); }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.modelBubble]}>
        {!isUser && <Bot color={theme.text.secondary} size={16} style={{ marginRight: spacing.sm, marginTop: 2 }} />}
        <Text style={isUser ? styles.userText : styles.modelText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="AI Support" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/support')} />
      <FlatList ref={flatListRef} data={messages} keyExtractor={item => item.id} renderItem={renderMessage} contentContainerStyle={styles.chatContainer} style={{ flex: 1 }} />
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <TextInput style={styles.input} placeholder="Type your message..." placeholderTextColor={theme.text.muted} value={input} onChangeText={setInput} onSubmitEditing={sendMessage} returnKeyType="send" />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]} onPress={sendMessage} disabled={!input.trim() || loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send color="#fff" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  chatContainer: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  messageBubble: { maxWidth: '80%', padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg, flexDirection: 'row' },
  userBubble: { backgroundColor: theme.accent.purple, alignSelf: 'flex-end', borderBottomRightRadius: radius.xs },
  modelBubble: { backgroundColor: theme.bg.card, alignSelf: 'flex-start', borderBottomLeftRadius: radius.xs },
  userText: { ...typography.body, color: '#FFFFFF', lineHeight: 22 },
  modelText: { ...typography.body, color: theme.text.primary, lineHeight: 22, flex: 1 },
  inputContainer: { flexDirection: 'row', padding: spacing.lg, backgroundColor: theme.bg.secondary, borderTopWidth: 1, borderTopColor: theme.border.subtle, alignItems: 'center' },
  input: { flex: 1, backgroundColor: theme.bg.input, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, color: theme.text.primary, ...typography.body, maxHeight: 100, ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} }) },
  sendBtn: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: theme.accent.purple, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.md },
});
