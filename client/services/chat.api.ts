import api from './api';
import type { ApiResponse, Chat, ChatMessage } from '@/types';

export const chatApi = {
  getChats: async () => {
    const response = await api.get<ApiResponse<Chat[]>>('/chats');
    return response.data;
  },

  getChat: async (chatId: string) => {
    const response = await api.get<ApiResponse<Chat>>(`/chats/${chatId}`);
    return response.data;
  },

  getChatByParticipant: async (participantId: string) => {
    const response = await api.get<ApiResponse<Chat>>(`/chats/participant/${participantId}`);
    return response.data;
  },

  sendMessage: async (chatId: string, text: string) => {
    const response = await api.post<ApiResponse<ChatMessage>>(`/chats/${chatId}/messages`, {
      text,
    });
    return response.data;
  },

  createChat: async (participantId: string) => {
    const response = await api.post<ApiResponse<Chat>>('/chats', { participantId });
    return response.data;
  },

  markAsRead: async (chatId: string) => {
    const response = await api.put<ApiResponse<{ success: boolean }>>(`/chats/${chatId}/read`);
    return response.data;
  },
};
