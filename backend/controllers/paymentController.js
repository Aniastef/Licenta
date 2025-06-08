// paymentController.js - Controller for Stripe payments
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Event from "../models/eventModel.js";


export const handlePaymentSuccess = async (req, res) => {
  console.log("📩 Backend (paymentController): Received req.body for handlePaymentSuccess:", req.body);
  try {
    const { userId, cart, paymentMethod, deliveryMethod, firstName, lastName, address, postalCode, city, phone } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Important: The cart here is the one sent from localStorage by the frontend.
    // We validate products based on this cart.
    const validProductsForOrder = [];

    for (const item of cart) { // Use `cart` from req.body, not `user.cart`
      if (!item.product || !item.product._id) {
         console.warn("Skipping invalid cart item in payment success:", item);
         continue;
      }

      let product = null;

      if (item.itemType === "Product") {
        product = await Product.findById(item.product._id);
        if (!product || !product.forSale || product.user.toString() === userId.toString()) {
          console.warn(`Product ${item.product._id} not found, not for sale, or self-purchase detected. Skipping.`);
          continue;
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.name}` });
        }

        product.quantity -= item.quantity;
        await product.save();

      } else if (item.itemType === "Event") {
        product = await Event.findById(item.product._id);
        if (!product || product.ticketType !== "paid") {
          console.warn(`Event ${item.product._id} not found or not a paid ticket. Skipping.`);
          continue;
        }
        if (product.capacity < item.quantity) {
          return res.status(400).json({ error: `Not enough tickets for ${product.title}` });
        }

        product.capacity -= item.quantity;
        await product.save();
      }

      if (!product) continue;

      validProductsForOrder.push({
        product: product._id,
        price: item.price,
        quantity: item.quantity,
        itemType: item.itemType || "Product",
      });
    }

    if (!validProductsForOrder.length) {
      return res.status(400).json({ error: "No valid products available to order or cart was empty initially." });
    }

    // Save exactly what's received from the frontend.
    user.orders.push({
      products: validProductsForOrder,
      status: "Pending",
      date: new Date(),
      paymentMethod: paymentMethod || "online",
      deliveryMethod: deliveryMethod || "courier",
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      address: address?.trim() || "",
      postalCode: postalCode?.trim() || "",
      city: city?.trim() || "",
      phone: phone?.trim() || "",
    });

    user.cart = []; // Clear the actual user's cart in DB
    await user.save();

    console.log("✅ Order placed successfully");
    return res.status(200).json({ message: "Order placed successfully" });

  } catch (error) {
    console.error("❌ Error handling payment success:", error);
    return res.status(500).json({ error: "Failed to process order" });
  }
};


export const processPayment = async (req, res) => {
  // This function is less critical for the current Stripe flow, but ensure consistency
  console.log("📩 Backend (paymentController): Received req.body for processPayment:", req.body);
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("cart.product");

    if (!user || !user.cart.length) {
      return res.status(200).json({ message: "Cart already processed" });
    }

    const order = new Order({ // Assuming Order model is imported or defined
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
  console.log("📩 Backend (paymentController): Received req.body for createCheckoutSession:", req.body);
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

   const currency = "eur";

    const lineItems = items.map((item) => ({
      price_data: {
    currency: "eur",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const totalAmount = lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
    if (totalAmount < 50) { // Stripe minimum charge is 0.50 EUR (50 cents)
      return res.status(400).json({
        error: `Total must be at least 0.50 EUR`,
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