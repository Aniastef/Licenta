import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// ✅ Adaugă un produs în cart
export const addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
  
      const user = await User.findById(userId).populate("cart.product");
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });
  
      const existingItem = user.cart.find((item) =>
        item.product.equals(productId)
      );
  
      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        user.cart.push({ product: productId, quantity: quantity || 1 });
      }
  
      await user.save();
      const updatedUser = await User.findById(userId).populate("cart.product"); // 🔹 Populează produsele
      res.json(updatedUser.cart);
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Something went wrong" });
    }
  };
  
  
  

// ✅ Obține conținutul cart-ului utilizatorului
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("cart.product");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ✅ Elimină un produs din cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = user.cart.filter((item) => !item.product.equals(productId));
    await user.save();

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};
