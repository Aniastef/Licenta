// --- routes/articleRoutes.js ---
import express from "express";
import {
  createArticle,
  getArticleById,
  getArticlesByUser,
  updateArticle,
  getMyArticles
} from "../controllers/articleController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createArticle);
router.get("/user/:username", getArticlesByUser);
router.get("/user/me", protectRoute, getMyArticles);
router.get("/:id", getArticleById);
router.put("/:id", protectRoute, updateArticle);

export default router;
