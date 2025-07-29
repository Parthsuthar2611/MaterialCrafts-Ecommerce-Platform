import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const CART_STORAGE_KEY = 'material-crafts-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const { user, isAuthenticated } = useAuth();

  // Load cart items from localStorage when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const savedCart = localStorage.getItem(`${CART_STORAGE_KEY}-${user.id}`);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } else {
      setItems([]); // Clear cart when user logs out
    }
  }, [isAuthenticated, user]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      localStorage.setItem(`${CART_STORAGE_KEY}-${user.id}`, JSON.stringify(items));
    }
  }, [items, isAuthenticated, user]);

  const addToCart = (product, design = null) => {
    setItems(currentItems => {
      const itemKey = `${product._id}-${design ? design._id : 'no-design'}`;
      
      const existingItemIndex = currentItems.findIndex(item => 
        item.product._id === product._id && 
        (!design ? !item.design : item.design?._id === design?._id)
      );

      if (existingItemIndex !== -1) {
        const newItems = [...currentItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + 1
        };
        return newItems;
      }

      return [...currentItems, {
        id: itemKey,
        product,
        design,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (id) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated && user?.id) {
      localStorage.removeItem(`${CART_STORAGE_KEY}-${user.id}`);
    }
  };

  const total = items.reduce((sum, item) => {
    const productPrice = item.product.price;
    const designPrice = item.design ? item.design.price : 0;
    return sum + (productPrice + designPrice) * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}