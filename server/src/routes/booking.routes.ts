import { Router } from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.use(protect);

router.post(
  '/',
  authorize('user'),
  validate([
    body('trainerId').notEmpty(),
    body('bookingDate').isISO8601(),
    body('timeSlot').notEmpty(),
    body('sessionType').notEmpty(),
  ]),
  bookingController.createBooking
);

router.get('/', authorize('user'), bookingController.getUserBookings);
router.get('/trainer', authorize('trainer'), bookingController.getTrainerBookings);
router.patch('/:id/status', authorize('trainer'), validate([body('status').isIn(['confirmed', 'cancelled', 'completed'])]), bookingController.updateBookingStatus);
router.patch('/:id/reschedule', validate([body('bookingDate').isISO8601(), body('timeSlot').notEmpty()]), bookingController.rescheduleBooking);
router.patch('/:id/cancel', authorize('user'), bookingController.cancelBooking);

export default router;
