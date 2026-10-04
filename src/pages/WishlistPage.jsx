import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import TourCard from '../components/tours/TourCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { savedTours } = useWishlist();

  return (
    <section className="wishlist-page">
      <div className="container">
        <header className="wishlist-header">
          <div>
            <p className="wishlist-eyebrow">Danh sách cá nhân</p>
            <h1>Tour đã lưu</h1>
            <p>Những hành trình bạn muốn xem lại được lưu trên thiết bị này.</p>
          </div>
          <span className="wishlist-count">{savedTours.length} tour</span>
        </header>

        {savedTours.length ? (
          <div className="wishlist-grid">
            {savedTours.map((tour) => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty">
            <FaHeart aria-hidden="true" />
            <h2>Chưa có tour nào được lưu</h2>
            <p>Chọn “Lưu tour” trên thẻ tour để tạo danh sách những hành trình bạn đang cân nhắc.</p>
            <Link className="btn btn-primary" to="/tours">Khám phá tour</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default WishlistPage;
