import { Router } from 'express';
import { chatWithSupport } from '../controllers/support.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/chat', protect, chatWithSupport);

export default router;
