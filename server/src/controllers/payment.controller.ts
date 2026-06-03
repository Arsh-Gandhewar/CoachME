import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import User from '../models/User';
import Trainer from '../models/Trainer';
import { env } from '../config/env';
import logger from '../utils/logger';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const setupCard = asyncHandler(async (req: AuthRequest, res: Response) => {
  let user = req.userRole === 'trainer' 
    ? await Trainer.findById(req.user._id)
    : await User.findById(req.user._id);
  
  if (!user) throw ApiError.notFound('User not found');

  // Create Razorpay customer if doesn't exist
  if (!user.razorpayCustomerId) {
    try {
      const customer = await razorpay.customers.create({
        name: (user as any).name || (user as any).fullName,
        email: user.email,
        contact: user.mobile || '9999999999'
      });
      user.razorpayCustomerId = customer.id;
      await user.save();
    } catch (err: any) {
      logger.error('Razorpay Customer Create Error:', err);
      throw ApiError.badRequest('Failed to create Razorpay customer');
    }
  }

  // Create a 1 INR order for card authorization
  const options = {
    amount: 100, // 1 INR in paise
    currency: 'INR',
    receipt: `setup_${user._id}`,
    customer_id: user.razorpayCustomerId,
    payment_capture: 1
  };

  const order = await razorpay.orders.create(options);

  return ApiResponse.success(res, {
    orderId: order.id,
    customerId: user.razorpayCustomerId,
    amount: 1
  }, 'Setup order created');
});

export const getSavedMethods = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.userRole === 'trainer' 
    ? await Trainer.findById(req.user._id)
    : await User.findById(req.user._id);

  if (!user || !user.razorpayCustomerId) {
    return ApiResponse.success(res, { items: [] });
  }

  try {
    const tokens = await razorpay.customers.fetchTokens(user.razorpayCustomerId);
    return ApiResponse.success(res, tokens);
  } catch (err: any) {
    logger.error('Razorpay fetch tokens error', err);
    return ApiResponse.success(res, { items: [] }); // return empty if fails
  }
});

export const deleteSavedMethod = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { tokenId } = req.params;
  const user = req.userRole === 'trainer' 
    ? await Trainer.findById(req.user._id)
    : await User.findById(req.user._id);

  if (!user || !user.razorpayCustomerId) {
    throw ApiError.badRequest('No Razorpay customer found');
  }

  try {
    await razorpay.customers.deleteToken(user.razorpayCustomerId, tokenId);
    return ApiResponse.success(res, null, 'Payment method removed');
  } catch (err: any) {
    logger.error('Razorpay delete token error', err);
    throw ApiError.badRequest('Failed to remove payment method');
  }
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');
  
  if (booking.userId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('You are not authorized to pay for this booking');
  }

  const amount = booking.price;

  const options = {
    amount: amount * 100, 
    currency: 'INR',
    receipt: `receipt_${bookingId}`,
  };

  let order;
  try {
    order = await razorpay.orders.create(options);
  } catch (err: any) {
    logger.error('Razorpay Order Create Error:', err);
    throw ApiError.badRequest(err?.error?.description || err?.message || 'Failed to create payment order');
  }

  const payment = await Payment.create({
    bookingId,
    userId: req.user._id,
    trainerId: booking.trainerId,
    amount,
    razorpayOrderId: order.id,
    paymentStatus: 'created',
  });

  return ApiResponse.created(res, {
    orderId: order.id,
    amount,
    currency: 'INR',
    paymentId: payment._id,
  }, 'Payment order created');
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) throw ApiError.notFound('Payment not found');

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw ApiError.badRequest('Invalid signature passed');
  }

  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.paymentStatus = 'captured';
  await payment.save();

  await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'paid', paymentId: payment._id });

  return ApiResponse.success(res, payment, 'Payment verified');
});

export const getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payments = await Payment.find({ userId: req.user._id })
    .populate('bookingId')
    .sort({ createdAt: -1 });
  return ApiResponse.success(res, payments);
});
