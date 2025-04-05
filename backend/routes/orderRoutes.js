import express from "express";
import { getUserOrders, addOrder, deleteOrder, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.get("/:userId", getUserOrders); // ✅ Obține comenzile unui utilizator
router.post("/:userId", addOrder); // ✅ Adaugă o comandă nouă
router.delete("/:userId/:orderId", deleteOrder); // ✅ Șterge o comandă
router.patch("/:userId/cancel/:orderId", cancelOrder);

export default router;
