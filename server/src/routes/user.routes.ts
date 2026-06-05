import { Router } from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as userController from '../controllers/user.controller';

const router = Router();
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/favorites/:trainerId', authorize('user', 'trainer'), userController.toggleFavorite);
router.get('/favorites', authorize('user', 'trainer'), userController.getFavorites);
router.get('/reviews', authorize('user'), userController.getMyReviews);
router.post(
  '/reviews',
  authorize('user'),
  validate([body('trainerId').notEmpty(), body('rating').isInt({ min: 1, max: 5 }), body('comment').notEmpty()]),
  userController.createReview
);

export default router;
