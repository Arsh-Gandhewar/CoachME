import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import Trainer from '../models/Trainer';
import { env } from '../config/env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

let TRAINER_PLAN_ID = env.RAZORPAY_TRAINER_PLAN_ID;

// Helper to ensure plan exists
const ensurePlan = async () => {
  if (TRAINER_PLAN_ID) return TRAINER_PLAN_ID;
  try {
    const plan = await razorpay.plans.create({
      period: 'monthly',
      interval: 1,
      item: {
        name: 'CoachME Premium Visibility',
        amount: 49900, // 499 INR in paise
        currency: 'INR',
        description: 'Monthly visibility subscription for trainers'
      }
    });
    TRAINER_PLAN_ID = plan.id;
    console.log('Created dynamic Razorpay Plan:', TRAINER_PLAN_ID);
    return TRAINER_PLAN_ID;
  } catch (error) {
    console.error('Failed to create Razorpay Plan', error);
    throw ApiError.internal('Failed to setup subscription plan');
  }
};

export const createSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'trainer') throw ApiError.unauthorized('Only trainers can subscribe');
  
  const trainer = await Trainer.findById(req.user._id);
  if (!trainer) throw ApiError.notFound('Trainer not found');

  const planId = await ensurePlan();

  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 120, // 10 years recurring
  });

  return ApiResponse.success(res, {
    subscriptionId: subscription.id,
    planId: planId
  }, 'Subscription created');
});

export const verifySubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'trainer') throw ApiError.unauthorized('Only trainers can verify');

  const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = req.body;
  if (!razorpayPaymentId || !razorpaySubscriptionId || !razorpaySignature) {
    throw ApiError.badRequest('Missing Razorpay verification details');
  }

  const trainer = await Trainer.findById(req.user._id);
  if (!trainer) throw ApiError.notFound('Trainer not found');

  const body = razorpayPaymentId + "|" + razorpaySubscriptionId;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw ApiError.badRequest('Invalid signature passed');
  }

  trainer.subscriptionStatus = 'active';
  trainer.razorpaySubscriptionId = razorpaySubscriptionId;
  // Set expiry to 30 days from now
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  trainer.subscriptionExpiryDate = expiry;

  await trainer.save();

  return ApiResponse.success(res, trainer, 'Subscription verified successfully');
});
