import express from 'express';
import protectRoute from '../middlewares/protectRoute.js';
import {
  addOrUpdateReview,
  getReviewsForProduct,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', protectRoute, addOrUpdateReview);

router.get('/:productId', getReviewsForProduct);

router.delete('/:productId', protectRoute, deleteReview);

export default router;
