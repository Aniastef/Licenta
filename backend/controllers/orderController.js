import User from "../models/userModel.js";
import Product from "../models/productModel.js";

/**
 * Obține comenzile unui utilizator
 */

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("orders.product");

        if (!user) return res.status(404).json({ error: "User not found" });

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
      const { products } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      products.forEach((product) => {
        user.orders.push({
          product: product._id,
          price: product.price,
          status: "Pending", // ✅ Starea inițială a comenzii
          date: new Date(),
        });
      });
  
      await user.save();
      res.status(201).json({ message: "Order added successfully", orders: user.orders });
    } catch (err) {
      console.error("Error adding order:", err.message);
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


  