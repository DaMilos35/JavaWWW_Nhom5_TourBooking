import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (tour, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.tour.id === tour.id);
      if (existingItem) {
        toast.success('Đã cập nhật số lượng trong giỏ hàng');
        return prevItems.map((item) =>
          item.tour.id === tour.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      toast.success('Đã thêm vào giỏ hàng');
      return [...prevItems, { tour, quantity }];
    });
  };

  const removeFromCart = (tourId) => {
    setItems((prevItems) => prevItems.filter((item) => item.tour.id !== tourId));
    toast.info('Đã xóa khỏi giỏ hàng');
  };

  const updateQuantity = (tourId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(tourId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.tour.id === tourId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.tour.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  return useContext(CartContext);
};
