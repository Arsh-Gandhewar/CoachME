import { Response } from 'express';
import Trainer from '../models/Trainer';
import Review from '../models/Review';
import Category from '../models/Category';
import Booking from '../models/Booking';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

export const getTrainers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { query, category, city, minPrice, maxPrice, minRating, sessionType, sort, page = '1', limit = '20', lat, lng } = req.query;

  const filter: any = { verificationStatus: 'verified', subscriptionStatus: 'active' };
  if (query) {
    const qStr = (query as string).toLowerCase().trim();
    
    filter.$or = [
      { fullName: { $regex: query, $options: 'i' } },
      { city: { $regex: query, $options: 'i' } },
      { specializations: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ];

    // Fuzzy match against known categories (allow 1 or 2 typos)
    const knownCategories = ['gym', 'yoga', 'swimming', 'badminton', 'martial-arts', 'dance', 'cricket', 'football', 'tennis', 'basketball', 'running', 'cycling', 'golf', 'nutrition', 'meditation', 'physiotherapy'];
    for (const cat of knownCategories) {
      // If the typo distance is <= 2 (for longer words) or <= 1 (for shorter words), inject it!
      const maxDistance = cat.length > 5 ? 2 : 1;
      if (levenshtein(qStr, cat) <= maxDistance) {
        filter.$or.push({ category: cat });
        filter.$or.push({ specializations: { $regex: cat, $options: 'i' } });
      }
    }
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
  const { date } = req.query;
  const trainer = await Trainer.findById(req.params.id).select('availability maxGroupCapacity');
  if (!trainer) throw ApiError.notFound('Trainer not found');

  let bookedSlots: string[] = [];
  let slotMetadata: Record<string, any> = {};

  if (date) {
    const bookings = await Booking.find({
      trainerId: req.params.id,
      bookingDate: new Date(date as string),
      bookingStatus: { $ne: 'cancelled' }
    });

    const maxCap = trainer.maxGroupCapacity || 10;
    const slotCounts: Record<string, number> = {};
    const slotTypes: Record<string, string> = {};

    bookings.forEach(b => {
      slotCounts[b.timeSlot] = (slotCounts[b.timeSlot] || 0) + 1;
      slotTypes[b.timeSlot] = b.sessionType;
    });

    Object.keys(slotCounts).forEach(slot => {
      const type = slotTypes[slot] || '';
      const count = slotCounts[slot];
      const isGroup = type.toLowerCase().includes('group') || type.toLowerCase().includes('online');
      
      if (!isGroup) {
        bookedSlots.push(slot);
      } else if (count >= maxCap) {
        bookedSlots.push(slot);
      }

      slotMetadata[slot] = {
        sessionType: type,
        bookedCount: count,
        remainingCapacity: isGroup ? (maxCap - count) : 0
      };
    });
  }

  return ApiResponse.success(res, {
    availability: trainer.availability,
    bookedSlots,
    slotMetadata
  });
});

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  return ApiResponse.success(res, categories);
});

export const getFeaturedTrainers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const trainers = await Trainer.aggregate([
    { $match: { verificationStatus: 'verified' } },
    { $sort: { rating: -1, totalReviews: -1 } },
    { $group: {
        _id: '$category',
        doc: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $limit: 6 }
  ]);
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
