import React, { createContext, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { useContext } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const user = useRecoilValue(userAtom);
  const userId = user?._id;
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`/api/cart/${userId}`, { credentials: 'include' });
      const data = await res.json();

      if (Array.isArray(data)) {
        setCart(data);
        console.log('Cart fetched successfully:', data);
      } else {
        console.warn('Cart response is not an array:', data);
        setCart([]);
      }
    } catch (err) {
      console.error(' Error fetching cart:', err);
      setCart([]);
    }
  };

  const updateCartQuantity = async (productId, quantity, itemType = 'Product') => {
    try {
      const res = await fetch(`/api/cart/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId, quantity, userId, itemType }),
      });
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(' Error updating quantity:', err);
    }
  };

  const removeFromCart = async (productId, itemType = 'Product') => {
    try {
      const res = await fetch(`/api/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, productId, itemType }),
      });
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error(' Error removing from cart:', err);
    }
  };

  const addToCart = async (newItem) => {
    if (!newItem || !newItem.product || !newItem.product._id) {
      console.error(' Invalid item passed to addToCart:', newItem);
      return;
    }

    if (!Array.isArray(cart)) {
      console.error('Cart is not an array:', cart);
      return;
    }

    const existingItem = cart.find((i) => i.product._id === newItem.product._id);

    if (existingItem) {
      const totalQty = existingItem.quantity + (newItem.quantity || 1);
      if (totalQty > newItem.product.quantity) {
        console.warn(' Not enough stock for ', newItem.product.name);
        return;
      }
      updateCartQuantity(newItem.product._id, totalQty, newItem.product.itemType || 'Product');
      return;
    }
    if (newItem.quantity > newItem.product.quantity) {
      console.warn('Not enough stock for', newItem.product.name);
      return;
    }

    try {
      const res = await fetch(`/api/cart/add-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          itemId: newItem.product._id,
          quantity: newItem.quantity || 1,
          itemType: newItem.product.itemType || 'Product',
        }),
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error('Server error:', data);
        return;
      }

      if (Array.isArray(data)) {
        setCart(data);
      } else {
        console.warn(' Cart response is not an array:', data);
        setCart([]);
      }
    } catch (err) {
      console.error(' Error adding to cart:', err);
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
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
