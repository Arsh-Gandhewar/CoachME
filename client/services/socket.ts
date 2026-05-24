import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/config';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    this.socket = io(baseUrl, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      this.socket?.emit('join', userId);
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
