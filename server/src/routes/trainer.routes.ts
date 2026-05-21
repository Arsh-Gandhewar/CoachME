import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as trainerController from '../controllers/trainer.controller';

const router = Router();

router.get('/', trainerController.getTrainers);
router.get('/featured', trainerController.getFeaturedTrainers);
router.get('/top-rated', trainerController.getTopRatedTrainers);
router.get('/categories', trainerController.getCategories);
router.get('/:id', trainerController.getTrainerById);
router.get('/:id/reviews', trainerController.getTrainerReviews);
router.get('/:id/availability', trainerController.getTrainerAvailability);

export default router;
