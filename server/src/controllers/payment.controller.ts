import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import Payment from '../models/Payment';

// Mock Razorpay (replace with real Razorpay SDK when API keys provided)
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingId, amount } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw ApiError.notFound('Booking not found');

  // Mock Razorpay order creation
  const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payment = await Payment.create({
    bookingId,
    userId: req.user._id,
    trainerId: booking.trainerId,
    amount,
    razorpayOrderId: mockOrderId,
    paymentStatus: 'created',
  });

  return ApiResponse.created(res, {
    orderId: mockOrderId,
    amount,
    currency: 'INR',
    paymentId: payment._id,
  }, 'Payment order created');
});

export const verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const payment = await Payment.findOne({ razorpayOrderId });
  if (!payment) throw ApiError.notFound('Payment not found');

  // In production, verify signature with Razorpay SDK
  // For now, mock verification
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
