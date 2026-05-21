import { Response } from 'express';
import User from '../models/User';
import Trainer from '../models/Trainer';
import Booking from '../models/Booking';
import Category from '../models/Category';
import Payment from '../models/Payment';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth';

export const getDashboard = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalTrainers, totalBookings, totalRevenue, pendingVerifications] = await Promise.all([
    User.countDocuments(),
    Trainer.countDocuments(),
    Booking.countDocuments(),
    Payment.aggregate([{ $match: { paymentStatus: 'captured' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Trainer.countDocuments({ verificationStatus: 'pending' }),
  ]);

  return ApiResponse.success(res, {
    totalUsers,
    totalTrainers,
    totalBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingVerifications,
  });
});

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  return ApiResponse.paginated(res, users, total, page, limit);
});

export const getTrainers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  const filter: any = {};
  if (status) filter.verificationStatus = status;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const [trainers, total] = await Promise.all([
    Trainer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Trainer.countDocuments(filter),
  ]);
  return ApiResponse.paginated(res, trainers, total, page, limit);
});

export const verifyTrainer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body; // 'verified' or 'rejected'
  const trainer = await Trainer.findByIdAndUpdate(req.params.id, { verificationStatus: status }, { new: true });
  return ApiResponse.success(res, trainer, `Trainer ${status}`);
});

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const [bookings, total] = await Promise.all([
    Booking.find().populate('userId', 'name email').populate('trainerId', 'fullName email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Booking.countDocuments(),
  ]);
  return ApiResponse.paginated(res, bookings, total, page, limit);
});

export const getRevenue = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const monthlyRevenue = await Payment.aggregate([
    { $match: { paymentStatus: 'captured' } },
    { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return ApiResponse.success(res, monthlyRevenue);
});

export const manageCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.method === 'POST') {
    const category = await Category.create(req.body);
    return ApiResponse.created(res, category);
  }
  if (req.method === 'PUT') {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return ApiResponse.success(res, category);
  }
  if (req.method === 'DELETE') {
    await Category.findByIdAndDelete(req.params.id);
    return ApiResponse.success(res, null, 'Category deleted');
  }
  const categories = await Category.find().sort({ order: 1 });
  return ApiResponse.success(res, categories);
});
