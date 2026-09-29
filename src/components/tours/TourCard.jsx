import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const categoryName = tour.category?.name || tour.category?.categoryName || 'Tour Du Lịch';

  return (
    <Link to={`/tours/${tour.id || tour.tourId}`} className="tour-card">
      <div className="tc-img-wrapper">
        <img 
          src={tour.imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80'} 
          alt={tour.name || tour.tourName} 
          className="tc-img"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80'; }}
        />
      </div>
      
      <div className="tc-content">
        <div className="tc-kicker">
          <span>{categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="tc-rating"><FaStar className="star-icon" /> {tour.rating || '4.9'}</span>
        </div>

        <h3 className="tc-title">{tour.name || tour.tourName}</h3>
        
        <div className="tc-meta">
          <span><FaMapMarkerAlt /> {tour.departureLocation || 'Việt Nam'}</span>
          <span aria-hidden="true">·</span>
          <span><FaClock /> {tour.duration || 3} ngày</span>
          {tour.availableSeats && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tc-seats">Còn {tour.availableSeats} chỗ</span>
            </>
          )}
        </div>
        
        <div className="tc-footer">
          <div className="tc-price-wrap">
            <span className="tc-price-label">Giá trọn gói từ</span>
            <span className="tc-price">{formatPrice(tour.price)}</span>
          </div>
          <span className="btn-book">Xem Chi Tiết</span>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
