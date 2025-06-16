import express from 'express';
import {
  createArticle,
  getArticleById,
  getArticlesByUser,
  updateArticle,
  getMyArticles,
  getAllArticlesFiltered,
  deleteArticle,
  getAllArticles,
} from '../controllers/articleController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/', protectRoute, createArticle);
router.get('/', getAllArticlesFiltered);

router.get('/user/me', protectRoute, getMyArticles);
router.get('/user/:username', getArticlesByUser);
router.get('/:id', getArticleById);
router.put('/:id', protectRoute, updateArticle);
router.delete('/:id', protectRoute, deleteArticle);
router.get('/admin/articles', protectRoute, getAllArticles);

export default router;
