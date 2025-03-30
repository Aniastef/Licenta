import React, { createContext, useContext, useState, useEffect } from "react";
import userAtom from "../atoms/userAtom";
import { useRecoilValue } from "recoil";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const user = useRecoilValue(userAtom);
  const userId = user?._id; // ✅ Ia userId din userAtom

  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const clearCart = () => {
    console.log("🚮 Clearing cart in frontend...");
    setCart([]);
    localStorage.removeItem("cart");
  };

  console.log("🔍 Extracted userId:", userId);
  console.log("🔍 User from Recoil:", user);

  useEffect(() => {
    console.log("Updated Cart:", cart); // 🔍 Debugging
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Fix: Nu blocăm contextul dacă utilizatorul nu este logat
  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No user logged in! Cart won't be loaded.");
      return;
    }

    const fetchCart = async () => {
      try {
        console.log(`🛒 Fetching cart for user ${userId}`);
        const response = await fetch(`/api/cart/${userId}`, {
          credentials: "include", // ✅ Adăugat
        });
        
        if (!response.ok) throw new Error("Failed to fetch cart");

        const userCart = await response.json();
        console.log("🛍 Cart fetched:", userCart);
        setCart(userCart);
      } catch (error) {
        console.error("❌ Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [userId]);

  const addToCart = async (product) => {
    if (!userId) {
      console.error("❌ User not logged in. Cannot add to cart.");
      return;
    }

    console.log(`🛒 Adding product: ${product.name} (ID: ${product._id}) for user ${userId}`);

    try {
      const response = await fetch("/api/cart/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Adăugat
        body: JSON.stringify({ userId, productId: product._id, quantity: 1 }),
      });

      if (!response.ok) throw new Error("Failed to add product to cart");

      const updatedCart = await response.json();
      console.log("✅ Cart updated:", updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error("❌ Error adding product to cart:", error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!userId) {
      console.error("❌ User not logged in. Cannot remove from cart.");
      return;
    }

    console.log(`🗑 Removing product ID: ${productId} from cart`);

    try {
      const response = await fetch("/api/cart/remove-from-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Adăugat
        body: JSON.stringify({ userId, productId }),
      });

      if (!response.ok) throw new Error("Failed to remove product from cart");

      const updatedCart = await response.json();
      console.log("✅ Cart updated after removal:", updatedCart);
      setCart(updatedCart);
    } catch (error) {
      console.error("❌ Error removing product from cart:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
