import User from "../models/userModel.js";
import Product from "../models/productModel.js";

/**
 * Obține comenzile unui utilizator
 */

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("orders.products.product");

    if (!user) return res.status(404).json({ error: "User not found" });

    // Poți să verifici aici dacă adresa este validă sau să o completezi cu "Adresa necunoscută" dacă este invalidă
    user.orders.forEach(order => {
      order.address = order.address && order.address !== "N/A" ? order.address : "Adresa necunoscută";
      order.city = order.city && order.city !== "N/A" ? order.city : "N/A";
      order.postalCode = order.postalCode && order.postalCode !== "N/A" ? order.postalCode : "N/A";
    });

    res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};





/**
 * Adaugă o comandă nouă
 */
export const addOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      products,
      paymentMethod,
      deliveryMethod,
      firstName,
      lastName,
      address,
      postalCode,
      city,
      phone,
    } = req.body;


    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newOrder = {
      products: products.map((p) => ({
        product: p._id,
        price: p.price,
        quantity: p.quantity || 1,
      })),
      status: "Pending",
      date: new Date(),
      paymentMethod: paymentMethod || "card",
      deliveryMethod: deliveryMethod || "courier",
      firstName,
      lastName,
      address,
      postalCode,
      city,
      phone,
    };

    user.orders.push(newOrder);
    await user.save();

    res.status(201).json({ message: "Order added", orders: user.orders });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Failed to add order" });
  }
};







  

/**
 * Șterge o comandă specifică
 */
export const deleteOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.orders = user.orders.filter((order) => order._id.toString() !== orderId);
    await user.save();

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err.message);
    res.status(500).json({ error: "Failed to delete order" });
  }
};


// ✅ Endpoint: anulare comandă (nu o șterge, doar îi schimbă statusul)
export const cancelOrder = async (req, res) => {
  try {
    const { userId, orderId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const order = user.orders.id(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = "Cancelled";
    await user.save();

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

// (aici rămân celelalte funcții pe care le ai deja, gen addOrder, getOrders etc.)


// Admin - Get All Orders from All Users
export const getAllOrders = async (req, res) => {
  try {
    console.log("✅ getAllOrders triggered"); // ADĂUGĂ ASTA

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.find({ "orders.0": { $exists: true } })
      .select("firstName lastName email orders")
      .populate("orders.products.product");

    const allOrders = users.flatMap(user =>
      user.orders.map(order => ({
        ...order.toObject(),
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      }))
    );

    res.status(200).json({ orders: allOrders });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ error: "Server error" });
  }
};
