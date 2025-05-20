import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Event from "../models/eventModel.js"; // 👈 Asigură-te că ai importat Event

export const addToCart = async (req, res) => {
  try {
    const { userId, itemId, quantity, itemType } = req.body;

    const itemModel = itemType === "Event" ? Event : Product;
    const item = await itemModel.findById(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ error: "User not found" });

    // 🧹 Elimină item-urile invalide
    user.cart = user.cart.filter(i => i.product !== null);

    const existingItem = user.cart.find(
      (i) => i.product && i.product._id.equals(itemId) && i.itemType === itemType
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        product: itemId,
        quantity,
        itemType: itemType || "Product", // default fallback
      });
    }

    await user.save();

 const updatedUser = await User.findById(userId).populate({
  path: "cart.product",
  refPath: "cart.itemType", // 🔧 Asta e cheia
  populate: { path: "user", model: "User" }
});



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

  const user = await User.findById(userId).populate({
  path: "cart.product",
  refPath: "cart.itemType", // 🔧 corect
  populate: { path: "user", model: "User" }
});




    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.cart);
  } catch (error) {
    console.error("❌ Error in getCart:", error);
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
   const updatedUser = await User.findById(userId).populate({
  path: "cart.product",
  refPath: "cart.itemType",
  populate: { path: "user", model: "User" }
});
res.json(updatedUser.cart);

  } catch (err) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};


export const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const user = await User.findById(userId).populate({
      path: "cart.product",
      populate: { path: "user", model: "User" }
    });
        if (!user) return res.status(404).json({ error: "User not found" });

    const item = user.cart.find((i) => i.product.equals(productId));
    if (item) {
      // Actualizează cantitatea produsului
      item.quantity = quantity;
    }

    await user.save();

    // ✅ Populăm produsele din nou
const updatedUser = await User.findById(userId).populate({
  path: "cart.product",
  refPath: "cart.itemType",
  populate: { path: "user", model: "User" }
});
res.json(updatedUser.cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};


