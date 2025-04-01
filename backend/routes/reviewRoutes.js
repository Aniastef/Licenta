// routes/reviewRoutes.js
import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  addOrUpdateReview,
  getReviewsForProduct,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// POST sau PUT review (1 per user/product)
router.post("/", protectRoute, addOrUpdateReview);

// GET toate review-urile pentru un produs
router.get("/:productId", getReviewsForProduct);

// DELETE review-ul utilizatorului curent pentru un produs
router.delete("/:productId", protectRoute, deleteReview);

export default router;
