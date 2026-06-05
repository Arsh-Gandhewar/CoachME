import { Response } from 'express';
import User from '../models/User';
import Trainer from '../models/Trainer';
import Review from '../models/Review';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  return ApiResponse.success(res, req.user);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowedUser = ['name', 'mobile', 'profileImage', 'gender', 'age', 'city', 'notificationPreferences', 'fcmToken'];
  const allowedTrainer = ['fullName', 'mobile', 'profilePhoto', 'portfolioImages', 'bio', 'resume', 'experience', 'certifications', 'achievements', 'pricing', 'categories', 'category', 'languages', 'city', 'availability', 'sessionTypes', 'specializations', 'exactLocation', 'isExactLocationShared', 'notificationPreferences', 'fcmToken'];

  const allowed = req.userRole === 'trainer' ? allowedTrainer : allowedUser;
  const updates: any = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  let updated: any;
  if (req.userRole === 'trainer') {
    updated = await Trainer.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  } else {
    updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  }

  return ApiResponse.success(res, updated, 'Profile updated');
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trainerId } = req.params;
  
  let entity: any;
  if (req.userRole === 'trainer') {
    entity = await Trainer.findById(req.user._id);
  } else {
    entity = await User.findById(req.user._id);
  }
  
  if (!entity) throw ApiError.notFound('Account not found');

  if (!entity.favorites) entity.favorites = [];
  const idx = entity.favorites.findIndex((f: any) => f.toString() === trainerId);
  if (idx > -1) {
    entity.favorites.splice(idx, 1);
  } else {
    entity.favorites.push(trainerId as any);
  }
  await entity.save();

  return ApiResponse.success(res, { favorites: entity.favorites }, idx > -1 ? 'Removed from favorites' : 'Added to favorites');
});

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  let entity: any;
  if (req.userRole === 'trainer') {
    entity = await Trainer.findById(req.user._id).populate('favorites');
  } else {
    entity = await User.findById(req.user._id).populate('favorites');
  }
  return ApiResponse.success(res, entity?.favorites || []);
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trainerId, rating, comment, bookingId } = req.body;

  const existing = await Review.findOne({ userId: req.user._id, trainerId });
  if (existing) throw ApiError.conflict('You have already reviewed this trainer');

  const review = await Review.create({ userId: req.user._id, trainerId, rating, comment, bookingId });
  return ApiResponse.created(res, review, 'Review submitted');
});

export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ userId: req.user._id }).select('trainerId bookingId');
  return ApiResponse.success(res, reviews);
});
