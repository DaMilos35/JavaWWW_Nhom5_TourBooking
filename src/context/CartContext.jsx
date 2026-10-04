import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';

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
    const tourId = tour.id || tour.tourId;
    const availableSeats = Number(tour.availableSeats);
    const existingItem = items.find((item) => String(item.tour.id || item.tour.tourId) === String(tourId));
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (hasTourDatePassed(tour.startDate || tour.endDate)) {
      toast.error('Ngày khởi hành của tour đã qua; cần cập nhật lịch trước khi đặt');
      return false;
    }
    if (!Number.isFinite(availableSeats) || availableSeats <= 0) {
      toast.error('Tour hiện không còn chỗ theo dữ liệu hiện tại');
      return false;
    }
    if (nextQuantity > availableSeats) {
      toast.error(`Số lượng trong giỏ không thể vượt quá ${availableSeats} chỗ còn lại`);
      return false;
    }

    if (existingItem) {
      setItems((prevItems) => prevItems.map((item) =>
        String(item.tour.id || item.tour.tourId) === String(tourId)
          ? { ...item, tour, quantity: nextQuantity }
          : item
      ));
      toast.success('Đã cập nhật số lượng trong giỏ hàng');
    } else {
      setItems((prevItems) => [...prevItems, { tour, quantity }]);
      toast.success('Đã thêm vào giỏ hàng');
    }
    return true;
  };

  const removeFromCart = (tourId) => {
    setItems((prevItems) => prevItems.filter(
      (item) => String(item.tour.id || item.tour.tourId) !== String(tourId)
    ));
    toast.info('Đã xóa khỏi giỏ hàng');
  };

  const updateQuantity = (tourId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(tourId);
      return;
    }
    const item = items.find((cartItem) => String(cartItem.tour.id || cartItem.tour.tourId) === String(tourId));
    const availableSeats = Number(item?.tour.availableSeats);
    if (item && (!Number.isFinite(availableSeats) || quantity > availableSeats)) {
      toast.error(`Số lượng không thể vượt quá ${Number.isFinite(availableSeats) ? availableSeats : 0} chỗ còn lại`);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        String(item.tour.id || item.tour.tourId) === String(tourId) ? { ...item, quantity } : item
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
