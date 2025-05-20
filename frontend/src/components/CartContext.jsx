import React, { createContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { useContext } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const user = useRecoilValue(userAtom);
  const userId = user?._id;
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchCart(); // 🛒 actualizează cartul de fiecare dată când userul se loghează
    }
  }, [userId]);
  

 const fetchCart = async () => {
  try {
    const res = await fetch(`/api/cart/${userId}`, { credentials: "include" });
    const data = await res.json();

    if (Array.isArray(data)) {
      setCart(data);
    } else {
      console.warn("⚠️ Cart response is not an array:", data);
      setCart([]); // fallback, previne cart.map error
    }
  } catch (err) {
    console.error("❌ Error fetching cart:", err);
    setCart([]); // fallback la eroare
  }
};


const updateCartQuantity = async (productId, quantity, itemType = "Product") => {
    try {
      const res = await fetch(`/api/cart/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
body: JSON.stringify({ productId, quantity, userId, itemType }),
      });
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("❌ Error updating quantity:", err);
    }
  };
  

const removeFromCart = async (productId, itemType = "Product") => {
    try {
      const res = await fetch(`/api/cart/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
body: JSON.stringify({ userId, productId, itemType }),
      });
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
    }
  };
  
  

  const addToCart = async (newItem) => {
    if (!newItem || !newItem.product || !newItem.product._id) {
      console.error("❌ Invalid item passed to addToCart:", newItem);
      return;
    }
  
    if (!Array.isArray(cart)) {
      console.error("❌ cart is not an array:", cart);
      return;
    }
  
    const existingItem = cart.find((i) => i.product._id === newItem.product._id);
  
    if (existingItem) {
      const totalQty = existingItem.quantity + (newItem.quantity || 1);
      if (totalQty > newItem.product.quantity) {
        console.warn("❌ Nu există stoc suficient pentru", newItem.product.name);
        return;
      }
updateCartQuantity(newItem.product._id, totalQty, newItem.product.itemType || "Product");
      return;
    }
    // Dacă nu există item, dar cantitatea cerută > stoc disponibil
if (newItem.quantity > newItem.product.quantity) {
  console.warn("❌ Cerere depășește stocul pentru", newItem.product.name);
  return;
}

  
    try {
      const res = await fetch(`/api/cart/add-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
  userId,
  itemId: newItem.product._id, // ← folosește `itemId`
  quantity: newItem.quantity || 1,
  itemType: newItem.product.itemType || "Product",
}),

      });
  
      const data = await res.json();
  
      if (!Array.isArray(data)) {
        console.error("❌ Server a returnat o eroare:", data);
        return;
      }
  
     if (Array.isArray(data)) {
  setCart(data);
} else {
  console.warn("❌ Cart response is not an array:", data);
  setCart([]); // fallback
}

    } catch (err) {
      console.error("❌ Error adding to cart:", err);
    }
  };
  
  
  
  

  return (
    <CartContext.Provider
  value={{
    cart,
    setCart,
    updateCartQuantity,
    removeFromCart,
    addToCart,
    fetchCart, // 🔁 expus aici
  }}
>

      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);
