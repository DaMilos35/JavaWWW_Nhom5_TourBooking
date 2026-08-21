import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const renderStars = (rating) => {
    const r = Math.round(rating || 4.5);
    return Array(5).fill(0).map((_, i) => (
      <FaStar key={i} color={i < r ? '#ffc107' : '#e4e5e9'} size={14} />
    ));
  };

  // Backend JPA serializes: tourId, tourName, departureLocation, imageUrl, price, duration, rating, category
  const tourName = tour.tourName || tour.name || 'Tour Du Lịch';
  const tourId   = tour.tourId   || tour.id;
  const categoryName = tour.category?.categoryName || tour.category?.name || '';

  return (
    <div className="tour-card">
      <div className="tour-img-wrapper">
        <img
          src={tour.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=60'}
          alt={tourName}
          className="tour-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Tour'; }}
        />
        {categoryName && <span className="tour-badge">{categoryName}</span>}
      </div>
      <div className="tour-info">
        <div className="tour-meta">
          <span className="duration"><FaClock size={12} /> {tour.duration || 3} ngày</span>
          <span className="location"><FaMapMarkerAlt size={12} /> {tour.departureLocation || 'TP.HCM'}</span>
        </div>
        <h3 className="tour-title" title={tourName}>{tourName}</h3>
        <div className="tour-rating">
          {renderStars(tour.rating)}
          <span className="rating-text">{tour.rating || '4.5'}</span>
        </div>
        <div className="tour-footer">
          <div className="tour-price">
            <span className="price-label">Từ</span>
            <span className="price-amount">{formatPrice(tour.price)}</span>
          </div>
          <Link to={`/tours/${tourId}`} className="btn-detail">Xem chi tiết</Link>
        </div>
      </div>
    </div>
  );
};

export default TourCard;

