import express from 'express';
import {
  likeUnlikeComment,
  dislikeUndislikeComment,
  addReply,
  addComment,
  getComments,
  deleteComment,
} from '../controllers/commentController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/:id/like', protectRoute, likeUnlikeComment);
router.post('/:id/dislike', protectRoute, dislikeUndislikeComment);
router.post('/reply', protectRoute, addReply);
router.post('/', protectRoute, addComment);
router.get('/', getComments);
router.delete('/:id', protectRoute, deleteComment);

export default router;
