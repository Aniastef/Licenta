// paymentController.js - Controler pentru plăți cu Stripe
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import User from "../models/userModel.js";



export const handlePaymentSuccess = async (req, res) => {
    try {
        const { userId } = req.body;

        console.log("🔹 Payment success request for user:", userId);

        const user = await User.findById(userId).populate("cart.product");

        if (!user) {
            console.log("❌ User not found!");
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.cart.length) {
            console.log("🛒 Cart already empty!");
            return res.status(400).json({ error: "Cart is empty" });
        }

        console.log("🛍 Moving products to orders:", user.cart);

        const newOrders = user.cart.map(item => ({
            product: item.product._id,
            price: item.product.price,
            status: "Pending",
            date: new Date(),
        }));

        user.orders.push(...newOrders);
        user.cart = []; // ✅ Golește coșul

        // 🔹 Folosește `findByIdAndUpdate` în loc de `.save()`, ca să eviți problema de versiune
        await User.findByIdAndUpdate(
            userId,
            { $set: { cart: [] }, $push: { orders: { $each: newOrders } } },
            { new: true, runValidators: true } // ✅ Evită problema cu versiunea documentului
        );

        console.log("✅ Order placed successfully");
        res.status(200).json({ message: "Order placed successfully", orders: newOrders });

    } catch (error) {
        console.error("❌ Error handling payment success:", error);
        res.status(500).json({ error: "Failed to process order" });
    }
};



export const processPayment = async (req, res) => {
    try {
        const userId = req.user._id; // Asigură-te că ai userId-ul extras corect
        const user = await User.findById(userId).populate("cart.product");

        if (!user || !user.cart.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Creăm comanda cu produsele din cart
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

        // Golim cart-ul
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
                currency: "ron", // Moneda setată corect în RON
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Prețul în bani (cenți)
            },
            quantity: item.quantity || 1, // Dacă nu există cantitate, presupunem 1
        }));

        // Verifică prețul total
        const totalAmount = lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
        console.log("🔹 Total amount in cents:", totalAmount);

        // Dacă totalul este mai mic de 2 RON, returnează o eroare
        if (totalAmount < 200) {
            return res.status(400).json({
                error: "The Checkout Session's total amount due must add up to at least Lei2.00 ron",
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


  
