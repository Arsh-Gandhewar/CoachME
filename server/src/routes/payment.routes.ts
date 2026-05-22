import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as paymentController from '../controllers/payment.controller';

const router = Router();
router.use(protect);

router.post('/create-order', validate([body('bookingId').notEmpty(), body('amount').isNumeric()]), paymentController.createOrder);
router.post('/verify', validate([body('razorpayOrderId').notEmpty()]), paymentController.verifyPayment);
router.get('/history', paymentController.getPaymentHistory);

router.post('/setup-card', paymentController.setupCard);
router.get('/methods', paymentController.getSavedMethods);
router.delete('/methods/:tokenId', paymentController.deleteSavedMethod);

export default router;
