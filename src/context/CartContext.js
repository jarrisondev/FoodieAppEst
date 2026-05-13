import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

const STORAGE_KEY = '@foodie_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(total);
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (dish) => {
    const existing = cartItems.find((item) => item.id === dish.id);
    let updatedCart;
    if (existing) {
      updatedCart = cartItems.map((item) =>
        item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [
        ...cartItems,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity: 1,
          notes: '',
        },
      ];
    }
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const removeFromCart = (dishId) => {
    const updatedCart = cartItems.filter((item) => item.id !== dishId);
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const incrementQuantity = (dishId) => {
    const updatedCart = cartItems.map((item) =>
      item.id === dishId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const decrementQuantity = (dishId) => {
    const target = cartItems.find((item) => item.id === dishId);
    if (!target) return;
    if (target.quantity <= 1) {
      removeFromCart(dishId);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.id === dishId ? { ...item, quantity: item.quantity - 1 } : item
    );
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const updateNotes = (dishId, notes) => {
    const updatedCart = cartItems.map((item) =>
      item.id === dishId ? { ...item, notes } : item
    );
    setCartItems(updatedCart);
    saveCart(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        updateNotes,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
