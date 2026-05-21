import { Response } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return ApiResponse.success(res, notifications);
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findByIdAndUpdate(req.params.id, { readStatus: true });
  return ApiResponse.success(res, null, 'Notification marked as read');
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.user._id, readStatus: false }, { readStatus: true });
  return ApiResponse.success(res, null, 'All notifications marked as read');
});
