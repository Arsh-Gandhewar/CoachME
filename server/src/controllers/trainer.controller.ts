import { Response } from 'express';
import Trainer from '../models/Trainer';
import Review from '../models/Review';
import Category from '../models/Category';
import Booking from '../models/Booking';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

export const getTrainers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, category, city, minPrice, maxPrice, minRating, sessionType, sort, page = '1', limit = '20', lat, lng } = req.query;

  const filter: any = { verificationStatus: 'verified', subscriptionStatus: 'active' };
  if (query) {
    filter.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { city: { $regex: query, $options: 'i' } },
      { specializations: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;
  if (city) filter.city = { $regex: city, $options: 'i' };
  if (minPrice || maxPrice) {
    filter.pricing = {};
    if (minPrice) filter.pricing.$gte = Number(minPrice);
    if (maxPrice) filter.pricing.$lte = Number(maxPrice);
  }
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (sessionType) filter.sessionTypes = sessionType;

  let sortBy: any = { rating: -1 };
  if (sort === 'price_low') sortBy = { pricing: 1 };
  else if (sort === 'price_high') sortBy = { pricing: -1 };
  else if (sort === 'experience') sortBy = { experience: -1 };
  else if (sort === 'reviews') sortBy = { totalReviews: -1 };

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, parseInt(limit as string));
  const skip = (pageNum - 1) * limitNum;

  let trainers;
  let total;

  if (lat && lng && !sort) {
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    const pipeline: any[] = [];

    pipeline.push({
      $geoNear: {
        near: { type: 'Point', coordinates: [userLng, userLat] },
        distanceField: 'calculatedDistance',
        spherical: true,
        query: filter
      }
    });

    pipeline.push({
      $addFields: {
        // Closer trainers get a higher score. We use a base of 100,000 and subtract the distance in meters.
        distanceScore: { $subtract: [ 100000, "$calculatedDistance" ] }, 
        reviewsScore: { $multiply: [ "$totalReviews", 100 ] }, 
        ratingScore: { $multiply: [ "$rating", 1000 ] }, 
        penalty: { $cond: { if: { $ne: ["$isExactLocationShared", true] }, then: 15000, else: 0 } }
      }
    });

    pipeline.push({
      $addFields: {
        recommendationScore: { 
          $subtract: [
            { $add: ["$distanceScore", "$reviewsScore", "$ratingScore"] },
            "$penalty"
          ] 
        }
      }
    });

    pipeline.push({ $sort: { recommendationScore: -1 } });

    const paginatedPipeline = [...pipeline, { $skip: skip }, { $limit: limitNum }];
    const countPipeline = [...pipeline, { $count: 'total' }];

    const [results, countResult] = await Promise.all([
      Trainer.aggregate(paginatedPipeline),
      Trainer.aggregate(countPipeline)
    ]);

    trainers = results.map(t => ({
      ...t,
      id: t._id,
      name: t.fullName,
      premium: t.isPremium,
      verified: t.verificationStatus === 'verified',
      reviewCount: t.totalReviews,
      gallery: t.portfolioImages,
      price: t.pricing,
      location: t.city,
    }));
    total = countResult.length > 0 ? countResult[0].total : 0;
  } else {
    const [standardTrainers, standardTotal] = await Promise.all([
      Trainer.find(filter).sort(sortBy).skip(skip).limit(limitNum),
      Trainer.countDocuments(filter),
    ]);
    trainers = standardTrainers;
    total = standardTotal;
  }

  return ApiResponse.paginated(res, trainers, total, pageNum, limitNum, 'Trainers fetched');
});

export const getTrainerById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trainer = await Trainer.findById(req.params.id).populate('reviews');
  if (!trainer) throw ApiError.notFound('Trainer not found');
  return ApiResponse.success(res, trainer);
});

export const getTrainerReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ trainerId: req.params.id })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 });
  return ApiResponse.success(res, reviews);
});

export const getTrainerAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const trainer = await Trainer.findById(req.params.id).select('availability');
  if (!trainer) throw ApiError.notFound('Trainer not found');
  return ApiResponse.success(res, trainer.availability);
});

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  return ApiResponse.success(res, categories);
});

export const getFeaturedTrainers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const trainers = await Trainer.find({ isPremium: true, verificationStatus: 'verified', subscriptionStatus: 'active' }).sort({ rating: -1 }).limit(10);
  return ApiResponse.success(res, trainers, 'Featured trainers');
});

export const getTopRatedTrainers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const trainers = await Trainer.find({ verificationStatus: 'verified', subscriptionStatus: 'active' }).sort({ rating: -1 }).limit(10);
  return ApiResponse.success(res, trainers, 'Top rated trainers');
});

export const getPlatformStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const [trainersCount, bookingsCount, categoriesCount] = await Promise.all([
    Trainer.countDocuments({ verificationStatus: 'verified', subscriptionStatus: 'active' }),
    Booking.countDocuments(),
    Category.countDocuments({ isActive: true })
  ]);
  return ApiResponse.success(res, { trainersCount, bookingsCount, categoriesCount }, 'Platform stats fetched');
});
