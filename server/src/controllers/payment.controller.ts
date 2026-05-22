import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { env } from '../config/env';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId, amount } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: 'INR',
    receipt: `receipt_${bookingId}`,
  };

  const order = await razorpay.orders.create(options);

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

  // Update booking payment status
  await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'paid', paymentId: payment._id });

  return ApiResponse.success(res, payment, 'Payment verified');
});

export const getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const payments = await Payment.find({ userId: req.user._id })
    .populate('bookingId')
    .sort({ createdAt: -1 });
  return ApiResponse.success(res, payments);
});
