import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { chatAPI } from '../../../services/endpoints';
import { Chat } from '../../../types';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';
import EmptyState from '../../../components/EmptyState';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChats = async () => {
    try {
      const res = await chatAPI.getChats();
      setChats(res.data.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchChats(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchChats(); };

  const renderItem = useCallback(({ item, index }: any) => {
    const photo = item.otherParticipant?.profileImage || item.otherParticipant?.profilePhoto;
    const name = item.otherParticipant?.name || item.otherParticipant?.fullName || 'Chat';
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <TouchableOpacity style={styles.chatItem} onPress={() => router.push({ pathname: '/(user)/chat/[id]' as any, params: { id: item.otherParticipant?._id } })} activeOpacity={0.7}>
          <Avatar uri={photo} name={name} size="md" />
          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{name}</Text>
            <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage?.text || 'No messages yet'}</Text>
          </View>
          <Text style={styles.time}>{item.lastMessage?.timestamp ? new Date(item.lastMessage.timestamp).toLocaleDateString() : ''}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [router]);

  return (
    <ScreenWrapper scroll={false}>
      <Text style={styles.title}>Messages</Text>
      {loading ? (
        <View style={styles.list}>
          <SkeletonLoader variant="list-item" count={5} />
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent.purple} />}
          ListEmptyComponent={
            <EmptyState
              icon={<MessageCircle size={40} color={theme.text.muted} />}
              title="No messages yet"
              subtitle="Start a conversation by visiting a trainer's profile"
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: theme.text.primary, marginBottom: spacing.lg },
  list: { paddingBottom: spacing['4xl'] },
  chatItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bg.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.sm, borderWidth: 1, borderColor: theme.border.subtle },
  chatInfo: { flex: 1, marginLeft: spacing.md },
  chatName: { color: theme.text.primary, ...typography.bodyMedium },
  lastMsg: { color: theme.text.secondary, ...typography.bodySmall, marginTop: spacing.xs },
  time: { color: theme.text.muted, ...typography.caption },
});
