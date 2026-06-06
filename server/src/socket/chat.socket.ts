import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat';
import logger from '../utils/logger';
import { env } from '../config/env';

export const initializeSocket = (httpServer: HttpServer) => {
  const allowedOrigins = env.NODE_ENV === 'production'
    ? ['https://coachme.app', 'https://www.coachme.app']
    : '*';

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins as any, methods: ['GET', 'POST'] },
  });

  // Authenticate socket connections with JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as any;
      (socket as any).userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.debug(`🔌 Socket connected: ${socket.id} (user: ${userId})`);

    // Auto-join user's own room based on authenticated userId
    socket.join(userId);

    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('send_message', async (data: { senderId: string; receiverId: string; text: string; chatId?: string }) => {
      // Ensure the sender matches the authenticated user
      if (data.senderId !== userId) {
        socket.emit('error', { message: 'Unauthorized: sender mismatch' });
        return;
      }

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
        logger.error('Socket message error:', error);
      }
    });

    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(`chat_${data.chatId}`).emit('user_typing', { userId: data.userId });
    });

    socket.on('stop_typing', (data: { chatId: string; userId: string }) => {
      socket.to(`chat_${data.chatId}`).emit('user_stop_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      logger.debug(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
