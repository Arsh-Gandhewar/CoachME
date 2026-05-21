import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/trainers', adminController.getTrainers);
router.patch('/trainers/:id/verify', adminController.verifyTrainer);
router.get('/bookings', adminController.getBookings);
router.get('/revenue', adminController.getRevenue);
router.route('/categories').get(adminController.manageCategories).post(adminController.manageCategories);
router.route('/categories/:id').put(adminController.manageCategories).delete(adminController.manageCategories);

export default router;
