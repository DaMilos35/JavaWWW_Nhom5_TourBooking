import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaStar } from 'react-icons/fa';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Link to={`/tours/${tour.id || tour.tourId}`} className="tour-card">
      <div className="tc-img-wrapper">
        <img 
          src={tour.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'} 
          alt={tour.name || tour.tourName} 
          className="tc-img"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Tour'; }}
        />
        <div className="tc-badge">
          <FaStar /> {tour.rating || '4.8'}
        </div>
      </div>
      
      <div className="tc-content">
        <h3 className="tc-title">{tour.name || tour.tourName}</h3>
        
        <div className="tc-meta">
          <span><FaMapMarkerAlt /> {tour.departureLocation || 'Hồ Chí Minh'}</span>
          <span><FaClock /> {tour.duration || 3} ngày</span>
        </div>
        
        <div className="tc-footer">
          <div className="tc-price-wrap">
            <span className="tc-price-label">Giá từ</span>
            <span className="tc-price">{formatPrice(tour.price)}</span>
          </div>
          <button className="btn-book">Chi Tiết</button>
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
