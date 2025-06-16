import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import upload from '../config/imgUpload.js';
import {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  markInterested,
  markGoing,
  getAllEvents,
  getAllUserEvents,
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/create', upload.single('coverImage'), protectRoute, createEvent);

router.get('/user/:username', getAllUserEvents);

router.get('/:eventId', getEvent);

router.put('/:eventId', protectRoute, updateEvent);

router.delete('/:eventId', protectRoute, deleteEvent);

router.post('/:eventId/interested', protectRoute, markInterested);
router.post('/:eventId/going', protectRoute, markGoing);
router.get('/', getAllEvents);

export default router;
