import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const getTourId = (tour) => String(tour.id || tour.tourId);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedTours, setSavedTours] = useState([]);

  // Tải danh sách yêu thích theo tài khoản người dùng đang đăng nhập
  useEffect(() => {
    if (!user) {
      // Khi chưa đăng nhập: Không lưu, xóa trắng danh sách, reload không giữ
      setSavedTours([]);
      return;
    }

    const userKey = `wishlist_user_${user.id || user.username}`;
    try {
      const stored = localStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedTours(Array.isArray(parsed) ? parsed : []);
      } else {
        setSavedTours([]);
      }
    } catch {
      setSavedTours([]);
    }
  }, [user]);

  // Đồng bộ vào kho lưu trữ riêng biệt của từng người dùng
  useEffect(() => {
    if (!user) return;
    const userKey = `wishlist_user_${user.id || user.username}`;
    try {
      localStorage.setItem(userKey, JSON.stringify(savedTours));
    } catch {
      // Bỏ qua lỗi hạn ngạch storage
    }
  }, [savedTours, user]);

  const isSaved = (tour) => {
    if (!user || !tour) return false;
    return savedTours.some((saved) => getTourId(saved) === getTourId(tour));
  };

  const toggleSaved = (tour) => {
    // Phân quyền: Bắt buộc đăng nhập mới được lưu tour
    if (!user) {
      toast.warning('Vui lòng đăng nhập tài khoản để lưu tour vào danh sách yêu thích!');
      return false;
    }

    const tourId = getTourId(tour);
    const alreadySaved = savedTours.some((saved) => getTourId(saved) === tourId);
    
    setSavedTours((current) => 
      alreadySaved
        ? current.filter((saved) => getTourId(saved) !== tourId)
        : [...current, tour]
    );

    toast.info(alreadySaved ? 'Đã bỏ tour khỏi danh sách yêu thích' : 'Đã lưu tour vào danh sách yêu thích của bạn');
    return true;
  };

  const removeSaved = (tourId) => {
    if (!user) return;
    setSavedTours((current) => current.filter((tour) => getTourId(tour) !== String(tourId)));
    toast.info('Đã bỏ tour khỏi danh sách yêu thích');
  };

  return (
    <WishlistContext.Provider value={{ savedTours, isSaved, toggleSaved, removeSaved }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
