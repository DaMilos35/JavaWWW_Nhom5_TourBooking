import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'tour-wishlist';

const readSavedTours = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const tours = stored ? JSON.parse(stored) : [];
    if (Array.isArray(tours)) return tours;
    if (stored) {
      console.error('Saved tours in local storage are not a list.');
      toast.error('Dữ liệu tour đã lưu bị lỗi và không thể sử dụng');
    }
    return [];
  } catch (error) {
    console.error('Unable to read saved tours from local storage.', error);
    toast.error('Không thể đọc danh sách tour đã lưu trên trình duyệt');
    return [];
  }
};

const getTourId = (tour) => String(tour.id || tour.tourId);

export const WishlistProvider = ({ children }) => {
  const [savedTours, setSavedTours] = useState(readSavedTours);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTours));
    } catch (error) {
      console.error('Unable to save wishlist to local storage.', error);
      toast.error('Không thể lưu danh sách tour trên trình duyệt này');
    }
  }, [savedTours]);

  const isSaved = (tour) => savedTours.some((saved) => getTourId(saved) === getTourId(tour));

  const toggleSaved = (tour) => {
    const tourId = getTourId(tour);
    const alreadySaved = savedTours.some((saved) => getTourId(saved) === tourId);
    setSavedTours((current) => alreadySaved
      ? current.filter((saved) => getTourId(saved) !== tourId)
      : [...current, tour]);
    toast.info(alreadySaved ? 'Đã bỏ tour khỏi danh sách yêu thích' : 'Đã lưu tour vào danh sách yêu thích');
  };

  const removeSaved = (tourId) => {
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
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
