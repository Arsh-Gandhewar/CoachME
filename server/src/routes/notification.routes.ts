import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as notifController from '../controllers/notification.controller';

const router = Router();
router.use(protect);

router.get('/', notifController.getNotifications);
router.patch('/:id/read', notifController.markRead);
router.patch('/read-all', notifController.markAllRead);

export default router;
