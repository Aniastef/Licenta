import express from 'express';
import {
  getUserNotifications,
  markAllAsSeen,
  markNotificationAsSeen,
} from '../controllers/notificationController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/', protectRoute, getUserNotifications);
router.post('/mark-all-seen', protectRoute, markAllAsSeen);
router.post('/:id/mark-seen', protectRoute, markNotificationAsSeen);

export default router;
