import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from '../controllers/messageController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/conversations', protectRoute, getConversations);
router.get('/:userId', protectRoute, getMessages);
router.post('/send', protectRoute, sendMessage);
router.patch('/seen/:userId', protectRoute, markMessagesAsRead); // 👈 nou

export default router;
