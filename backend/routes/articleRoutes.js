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

// Ordinea corectă a rutelor contează!
router.post("/", protectRoute, createArticle);
router.get("/", getAllArticlesFiltered); // ✅ returnează toate articolele (filtrabil)

router.get("/user/me", protectRoute, getMyArticles);       // 🔼 mai sus
router.get("/user/:username", getArticlesByUser);          // 🔼 mai sus
router.get("/:id", getArticleById);                         // trebuie să fie ultima GET
router.put("/:id", protectRoute, updateArticle);
router.delete("/:id", protectRoute, deleteArticle);

export default router;
