// paymentController.js - Controler pentru plăți cu Stripe
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import User from "../models/userModel.js";
import Product from "../models/productModel.js";

export const handlePaymentSuccess = async (req, res) => {
    try {
      const { userId } = req.body;
  
      console.log("🔹 Payment success request for user:", userId);
  
      const user = await User.findById(userId).populate("cart.product");
      if (!user) return res.status(404).json({ error: "User not found" });
  
      if (!user.cart.length) {
        console.log("🛒 Cart already empty!");
        return res.status(400).json({ error: "Cart is empty" });
      }
  
      const newOrders = [];

      for (const item of user.cart) {
        const product = await Product.findById(item.product._id);

        if (!product || !product.forSale) {
          console.log(`⚠️ Product not for sale: ${item.product.name}`);
          continue;
        }

        // 🔐 Previne cumpărarea propriului produs
        if (product.user.toString() === userId.toString()) {
          console.log(`⛔ User tried to buy their own product: ${product.name}`);
          continue;
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.name}` });
        }

        product.quantity -= item.quantity;
        await product.save();

        newOrders.push({
          product: item.product._id,
          price: item.product.price,
          quantity: item.quantity,
          status: "Pending",
          date: new Date(),
        });
      }

      if (!newOrders.length) {
        return res.status(400).json({ error: "No valid orders could be processed." });
      }

      await User.findByIdAndUpdate(
        userId,
        {
          $set: { cart: [] },
          $push: { orders: { $each: newOrders } },
        },
        { new: true, runValidators: true }
      );

      console.log("✅ Order placed successfully");
      return res.status(200).json({ message: "Order placed successfully", orders: newOrders });

    } catch (error) {
      console.error("❌ Error handling payment success:", error);
      return res.status(500).json({ error: "Failed to process order" });
    }
};

export const processPayment = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("cart.product");

        if (!user || !user.cart.length) {
            return res.status(200).json({ message: "Cart already processed" });
        }

        const order = new Order({
            user: userId,
            products: user.cart.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
            })),
            totalPrice: user.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
            status: "Paid",
        });

        await order.save();

        user.cart = [];
        await user.save();

        return res.status(200).json({ message: "Payment successful, order created", order });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ message: "Payment failed" });
    }
};

export const createCheckoutSession = async (req, res) => {
    try {
      const { items } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
      }

      const lineItems = items.map((item) => ({
        price_data: {
          currency: "ron",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      }));

      const totalAmount = lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
      console.log("🔹 Total amount in cents:", totalAmount);

      if (totalAmount < 200) {
        return res.status(400).json({
          error: "Total must be at least 2 RON",
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:5173/checkout?success=true",
        cancel_url: "http://localhost:5173/checkout?canceled=true",
      });

      console.log("✅ Checkout session created:", session.id);
      res.json({ sessionId: session.id });

    } catch (error) {
      console.error("❌ Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
};
