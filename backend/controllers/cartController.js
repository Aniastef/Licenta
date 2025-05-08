import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// ✅ Adaugă un produs în cart
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔍 Curăță produsele invalide (șterse din DB)
    user.cart = user.cart.filter(item => item.product !== null);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const existingItem = user.cart.find((item) =>
      item.product && item.product.equals(productId)
    );

    if (existingItem) {
      existingItem.quantity += quantity; // Actualizează cantitatea
    } else {
      user.cart.push({ product: productId, quantity });
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

    // ✅ Populează din nou produsele
    const updatedUser = await User.findById(userId).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};


export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const item = user.cart.find((i) => i.product.equals(productId));
    if (item) {
      // Actualizează cantitatea produsului
      item.quantity = quantity;
    }

    await user.save();

    // ✅ Populăm produsele din nou
    const updatedUser = await User.findById(userId).populate("cart.product");
    res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};


