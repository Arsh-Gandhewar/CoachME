import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import Chat from '../models/Chat';

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('send_message', async (data: { senderId: string; receiverId: string; text: string; chatId?: string }) => {
      try {
        let chat;
        if (data.chatId) {
          chat = await Chat.findById(data.chatId);
        } else {
          chat = await Chat.findOne({ participants: { $all: [data.senderId, data.receiverId] } });
        }

        if (!chat) {
          chat = await Chat.create({ participants: [data.senderId, data.receiverId], messages: [] });
        }

        const message = {
          senderId: data.senderId,
          text: data.text,
          timestamp: new Date(),
          seen: false,
        };

        chat.messages.push(message as any);
        chat.lastMessage = { text: data.text, timestamp: new Date(), senderId: data.senderId as any };
        await chat.save();

        // Emit to both participants
        io.to(data.receiverId).emit('new_message', { chatId: chat._id, message });
        io.to(data.senderId).emit('message_sent', { chatId: chat._id, message });
        io.to(`chat_${chat._id}`).emit('chat_message', { chatId: chat._id, message });
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(`chat_${data.chatId}`).emit('user_typing', { userId: data.userId });
    });

    socket.on('stop_typing', (data: { chatId: string; userId: string }) => {
      socket.to(`chat_${data.chatId}`).emit('user_stop_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
