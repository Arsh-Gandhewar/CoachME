import { Router } from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as subController from '../controllers/subscription.controller';

const router = Router();
router.use(protect);

router.post('/create', subController.createSubscription);
router.post('/verify', validate([
  body('razorpayPaymentId').notEmpty(),
  body('razorpaySubscriptionId').notEmpty(),
  body('razorpaySignature').notEmpty()
]), subController.verifySubscription);

export default router;
