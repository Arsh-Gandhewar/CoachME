import express from 'express';
import { protect } from '../middleware/auth';
import { uploadImage, uploadMiddleware } from '../controllers/upload.controller';

const router = express.Router();

router.post('/', uploadMiddleware.single('image'), uploadImage);

export default router;
