import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const getStorageKey = (user) => {
  if (!user) return null;
  return `tour-wishlist_${user.id || user.username}`;
};

const getTourId = (tour) => String(tour.id || tour.tourId);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedTours, setSavedTours] = useState([]);

  // Đồng bộ danh sách yêu thích theo từng tài khoản riêng biệt
  useEffect(() => {
    if (!user) {
      // Chưa đăng nhập -> Tuyệt đối không hiển thị data cũ của tài khoản khác
      setSavedTours([]);
      return;
    }

    const key = getStorageKey(user);
    if (!key) return;

    try {
      const stored = localStorage.getItem(key);
      const tours = stored ? JSON.parse(stored) : [];
      setSavedTours(Array.isArray(tours) ? tours : []);
    } catch (error) {
      console.error('Lỗi đọc wishlist từ localStorage:', error);
      setSavedTours([]);
    }
  }, [user]);

  // Lưu thay đổi vào bộ nhớ riêng của tài khoản hiện tại
  useEffect(() => {
    if (!user) return;
    const key = getStorageKey(user);
    if (!key) return;

    try {
      localStorage.setItem(key, JSON.stringify(savedTours));
    } catch (error) {
      console.error('Không thể lưu wishlist vào localStorage:', error);
    }
  }, [savedTours, user]);

  const isSaved = (tour) => {
    if (!user || !tour) return false;
    return savedTours.some((saved) => getTourId(saved) === getTourId(tour));
  };

  const toggleSaved = (tour) => {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để lưu tour vào danh sách yêu thích!');
      return false;
    }

    const tourId = getTourId(tour);
    const alreadySaved = savedTours.some((saved) => getTourId(saved) === tourId);
    
    setSavedTours((current) =>
      alreadySaved
        ? current.filter((saved) => getTourId(saved) !== tourId)
        : [...current, tour]
    );

    if (alreadySaved) {
      toast.info(`Đã bỏ "${tour.name || tour.tourName}" khỏi danh sách yêu thích`);
    } else {
      toast.success(`Đã lưu "${tour.name || tour.tourName}" vào danh sách yêu thích`);
    }
    return true;
  };

  const removeSaved = (tourId) => {
    if (!user) return;
    setSavedTours((current) => current.filter((tour) => getTourId(tour) !== String(tourId)));
    toast.info('Đã bỏ tour khỏi danh sách yêu thích');
  };

  const clearWishlist = () => {
    if (user) {
      const key = getStorageKey(user);
      if (key) localStorage.removeItem(key);
    }
    setSavedTours([]);
  };

  return (
    <WishlistContext.Provider value={{ savedTours, isSaved, toggleSaved, removeSaved, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
