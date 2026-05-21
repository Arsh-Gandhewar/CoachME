import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
    body('role').isIn(['user', 'trainer']).withMessage('Role must be user or trainer'),
  ]),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ]),
  authController.login
);

router.post('/send-otp', authLimiter, validate([body('email').isEmail()]), authController.sendOtp);
router.post('/verify-otp', authLimiter, validate([body('email').isEmail(), body('otp').isLength({ min: 6, max: 6 })]), authController.verifyOtp);
router.post('/forgot-password', authLimiter, validate([body('email').isEmail()]), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate([body('token').notEmpty(), body('password').isLength({ min: 6 })]), authController.resetPassword);
router.post('/refresh-token', validate([body('refreshToken').notEmpty()]), authController.refreshToken);
router.post(
  '/change-password',
  protect,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  ]),
  authController.changePassword
);
router.get('/me', protect, authController.getMe);

export default router;
