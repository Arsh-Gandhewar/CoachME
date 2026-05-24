import { Router } from 'express';
import { protect } from '../middleware/auth';
import * as chatController from '../controllers/chat.controller';

const router = Router();
router.use(protect);

router.get('/', chatController.getChats);
router.post('/broadcast', chatController.broadcastMessage);
router.get('/:chatId/messages', chatController.getMessages);
router.get('/by-receiver/:receiverId', chatController.getChatByReceiver);
router.post('/:receiverId/message', chatController.sendMessage);

export default router;
