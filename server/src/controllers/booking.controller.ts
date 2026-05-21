import { Response } from 'express';
import Booking from '../models/Booking';
import Trainer from '../models/Trainer';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth';

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { trainerId, bookingDate, timeSlot, sessionType, notes } = req.body;

  const trainer = await Trainer.findById(trainerId);
  if (!trainer) throw ApiError.notFound('Trainer not found');

  const booking = await Booking.create({
    userId: req.user._id,
    trainerId,
    bookingDate,
    timeSlot,
    sessionType,
    notes,
    price: trainer.pricing,
  });

  // Notify trainer
  await Notification.create({
    userId: trainerId,
    userModel: 'Trainer',
    title: 'New Booking Request',
    message: `You have a new ${sessionType} booking on ${new Date(bookingDate).toLocaleDateString()}`,
    type: 'booking',
    data: { bookingId: booking._id },
  });

  return ApiResponse.created(res, booking, 'Booking created');
});

export const getUserBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate('trainerId', 'fullName profilePhoto category city pricing')
    .sort({ bookingDate: -1 });
  return ApiResponse.success(res, bookings);
});

export const getTrainerBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookings = await Booking.find({ trainerId: req.user._id })
    .populate('userId', 'name profileImage email mobile')
    .sort({ bookingDate: -1 });
  return ApiResponse.success(res, bookings);
});

export const updateBookingStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  booking.bookingStatus = status;
  await booking.save();

  // Notify user
  await Notification.create({
    userId: booking.userId,
    userModel: 'User',
    title: `Booking ${status}`,
    message: `Your booking has been ${status}`,
    type: 'booking',
    data: { bookingId: booking._id },
  });

  return ApiResponse.success(res, booking, `Booking ${status}`);
});

export const rescheduleBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { bookingDate, timeSlot } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw ApiError.notFound('Booking not found');

  booking.bookingDate = bookingDate;
  booking.timeSlot = timeSlot;
  await booking.save();

  return ApiResponse.success(res, booking, 'Booking rescheduled');
});
