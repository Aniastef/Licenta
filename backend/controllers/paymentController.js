// paymentController.js - Controler pentru plăți cu Stripe
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Event from "../models/eventModel.js";


export const handlePaymentSuccess = async (req, res) => {
  try {
    const { userId, cart, paymentMethod, deliveryMethod, firstName, lastName, address, postalCode, city, phone } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.cart.length) return res.status(400).json({ error: "Cart is empty" });

    const validProductsForOrder = [];

    for (const item of user.cart) {
      if (!item.product) continue;

      let product = null;

      if (item.itemType === "Product") {
        product = await Product.findById(item.product._id);
        if (!product || !product.forSale || product.user.toString() === userId.toString()) continue;
        if (product.quantity < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.name}` });
        }

        product.quantity -= item.quantity;
        await product.save();

      } else if (item.itemType === "Event") {
        product = await Event.findById(item.product._id);
        if (!product || product.ticketType !== "paid") continue;
        if (product.capacity < item.quantity) {
          return res.status(400).json({ error: `Not enough tickets for ${product.title}` });
        }

        product.capacity -= item.quantity;
        await product.save();
      }

      if (!product) continue;

      validProductsForOrder.push({
        product: product._id,
        price: product.price,
        quantity: item.quantity,
        itemType: item.itemType || "Product",
      });
    }

    if (!validProductsForOrder.length) {
      return res.status(400).json({ error: "No valid products available to order" });
    }

    const normalize = (val) => (typeof val === "string" && val.trim() !== "" ? val.trim() : "N/A");

user.orders.push({
  products: validProductsForOrder,
  status: "Pending",
  date: new Date(),
  paymentMethod: paymentMethod || "online",
  deliveryMethod: deliveryMethod || "courier",
  firstName: firstName?.trim() || user.firstName || "N/A",
  lastName: lastName?.trim() || user.lastName || "N/A",
address: address?.trim() || "Unknown address",
postalCode: postalCode?.trim() || "Postal code not available",
city: city?.trim() || "Unknown city",
phone: phone?.trim() || "Phone not available",

});

    user.cart = [];
    await user.save();

    console.log("✅ Order placed successfully");
    return res.status(200).json({ message: "Order placed successfully" });

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

   const currency = "eur"; // Folosește o monedă fixă


    const lineItems = items.map((item) => ({
      price_data: {
    currency: "eur", // valoare fixă
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    const totalAmount = lineItems.reduce((total, item) => total + item.price_data.unit_amount * item.quantity, 0);
    if (totalAmount < 200) {
      return res.status(400).json({
        error: `Total must be at least 2 EUR}`,
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
