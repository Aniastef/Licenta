import express from "express";
import { createCheckoutSession, handlePaymentSuccess, processPayment } from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);
router.post("/payment-success", handlePaymentSuccess);
router.post("/process", processPayment);


export default router;
