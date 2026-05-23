import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supportAPI } from '../../services/endpoints';
import { Send, Bot, User } from 'lucide-react-native';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function SupportChatScreen() {
  const router = useRouter();
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
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: 'Sorry, I encountered an error. Please try again later.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.modelBubble]}>
        {!isUser && <Bot color="#A1A1AA" size={16} style={{ marginRight: 8, marginTop: 2 }} />}
        <Text style={isUser ? styles.userText : styles.modelText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior="padding"
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/support')}
        >
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Support Chat</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        style={{ flex: 1 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity 
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Send color="#fff" size={20} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, backgroundColor: '#0A0A0A', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#A1A1AA', fontSize: 12 },
  title: { color: '#fff', fontSize: 12, fontWeight: '700' },
  
  chatContainer: { padding: 16, paddingBottom: 32 },
  
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
  },
  userBubble: {
    backgroundColor: '#C9B07D',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: '#141414',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userText: { color: '#fff', fontSize: 12, lineHeight: 22 },
  modelText: { color: '#E0E0E0', fontSize: 12, lineHeight: 22, flex: 1 },
  
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 12,
    maxHeight: 100,
    ...Platform.select({ web: { outlineStyle: 'none' as any }, default: {} })
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C9B07D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  }
});
