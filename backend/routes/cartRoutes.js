import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add-to-cart", addToCart); // ✅ Adaugă un produs în cart
router.get("/:userId", getCart); // ✅ Obține conținutul cart-ului
router.post("/remove-from-cart", removeFromCart); // ✅ Elimină un produs

export default router;
