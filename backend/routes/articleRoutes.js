// --- routes/articleRoutes.js ---
import express from "express";
import {
  createArticle,
  getArticleById,
  getArticlesByUser,
  updateArticle,
  getMyArticles,
  getAllArticlesFiltered,
  deleteArticle
} from "../controllers/articleController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createArticle);
router.get("/", getAllArticlesFiltered); // 👈 noua rută pentru toate articolele cu filtre

router.get("/user/:username", getArticlesByUser);
router.get("/user/me", protectRoute, getMyArticles);
router.get("/:id", getArticleById);
router.put("/:id", protectRoute, updateArticle);
router.delete("/:id", protectRoute, deleteArticle);
export default router;
