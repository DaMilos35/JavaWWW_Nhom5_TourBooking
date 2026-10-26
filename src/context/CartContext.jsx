import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartStorageKey = (user) => {
  if (!user) return 'cart_guest';
  return `cart_${user.id || user.username}`;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Tải giỏ hàng theo từng tài khoản riêng biệt
  useEffect(() => {
    const key = getCartStorageKey(user);
    try {
      const savedCart = localStorage.getItem(key);
      setItems(savedCart ? JSON.parse(savedCart) : []);
    } catch {
      setItems([]);
    }
  }, [user]);

  // Lưu giỏ hàng theo tài khoản tương ứng
  useEffect(() => {
    const key = getCartStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error('Không thể lưu giỏ hàng:', e);
    }
  }, [items, user]);

  const addToCart = (tour, quantity = 1) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập tài khoản để đặt chỗ chuyến đi!');
      return false;
    }

    const tourId = tour.id || tour.tourId;
    const availableSeats = Number(tour.availableSeats);
    const existingItem = items.find((item) => String(item.tour.id || item.tour.tourId) === String(tourId));
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (hasTourDatePassed(tour.startDate || tour.endDate)) {
      toast.error('Ngày khởi hành của tour đã qua; vui lòng chọn ngày khác');
      return false;
    }
    if (!Number.isFinite(availableSeats) || availableSeats <= 0) {
      toast.error('Tour hiện không còn chỗ trống');
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
      toast.success('Đã thêm tour vào giỏ hàng');
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
    const key = getCartStorageKey(user);
    localStorage.removeItem(key);
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
