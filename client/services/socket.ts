import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return localStorage.getItem('accessToken');
  return SecureStore.getItemAsync('accessToken');
};

class SocketService {
  private socket: Socket | null = null;

  async connect(userId: string) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const token = await getToken();
    this.socket = io(baseUrl, {
      transports: ['websocket'],
      auth: { token },
    });

    return this.socket;
  }

  joinChat(chatId: string) {
    this.socket?.emit('join_chat', chatId);
  }

  sendMessage(senderId: string, receiverId: string, text: string, chatId?: string) {
    this.socket?.emit('send_message', { senderId, receiverId, text, chatId });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onMessageSent(callback: (data: any) => void) {
    this.socket?.on('message_sent', callback);
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  emitTyping(chatId: string, userId: string) {
    this.socket?.emit('typing', { chatId, userId });
  }

  emitStopTyping(chatId: string, userId: string) {
    this.socket?.emit('stop_typing', { chatId, userId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export default new SocketService();
