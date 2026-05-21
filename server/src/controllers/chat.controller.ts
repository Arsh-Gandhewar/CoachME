import { Response } from 'express';
import Chat from '../models/Chat';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

export const getChats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chats = await Chat.find({ participants: req.user._id }).sort({ updatedAt: -1 });
  return ApiResponse.success(res, chats);
});

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) throw ApiError.notFound('Chat not found');
  if (!chat.participants.includes(req.user._id)) throw ApiError.forbidden('Access denied');
  return ApiResponse.success(res, chat.messages);
});

export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { receiverId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  let chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    chat = await Chat.create({ participants: [senderId, receiverId], messages: [] });
  }

  const message = { senderId, text, timestamp: new Date(), seen: false };
  chat.messages.push(message as any);
  chat.lastMessage = { text, timestamp: new Date(), senderId };
  await chat.save();

  return ApiResponse.created(res, message, 'Message sent');
});
