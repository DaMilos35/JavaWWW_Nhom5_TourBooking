import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrashAlt, FaCompass } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import TourCard from '../components/tours/TourCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { savedTours, clearWishlist } = useWishlist();
  const { user } = useAuth();

  return (
    <section className="wishlist-page">
      <div className="container">
        <header className="wishlist-header">
          <div>
            <p className="wishlist-eyebrow">Tài khoản @{user?.username || 'Cá nhân'}</p>
            <h1>Danh Sách Tour Đã Lưu</h1>
            <p>Những chuyến đi bạn quan tâm và lưu riêng cho tài khoản của mình.</p>
          </div>
          <div className="wishlist-header-actions">
            <span className="wishlist-count">{savedTours.length} tour</span>
            {savedTours.length > 0 && (
              <button 
                type="button" 
                className="btn btn-outline btn-clear-all" 
                onClick={clearWishlist}
                title="Xóa toàn bộ tour đã lưu"
              >
                <FaTrashAlt /> Xóa tất cả
              </button>
            )}
          </div>
        </header>

        {savedTours.length ? (
          <div className="wishlist-grid">
            {savedTours.map((tour) => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty card-surface">
            <div className="empty-heart-icon">
              <FaHeart aria-hidden="true" />
            </div>
            <h2>Bạn chưa lưu tour nào</h2>
            <p>Nhấn vào biểu tượng “Lưu” trên bất kỳ tour nào để đánh dấu các chuyến đi yêu thích của riêng bạn.</p>
            <Link className="btn btn-primary" to="/tours">
              <FaCompass /> Khám phá tour ngay
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistPage;
