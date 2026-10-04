import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import FallbackImage from '../common/FallbackImage';
import { useWishlist } from '../../context/WishlistContext';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const { isSaved, toggleSaved } = useWishlist();
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const categoryName = tour.category?.name || tour.category?.categoryName || 'Tour Du Lịch';
  const hasSeatCount = tour.availableSeats !== undefined && tour.availableSeats !== null;
  const saved = isSaved(tour);

  return (
    <div className="tour-card-wrap">
      <Link to={`/tours/${tour.id || tour.tourId}`} className="tour-card">
        <div className="tc-img-wrapper">
          <FallbackImage
            src={tour.imageUrl}
            alt={tour.name || tour.tourName}
            className="tc-img"
            loading="lazy"
          />
        </div>
        
        <div className="tc-content">
          <div className="tc-kicker">
            <span>{categoryName}</span>
          </div>

          <h3 className="tc-title">{tour.name || tour.tourName}</h3>

          <div className="tc-meta">
            <span><FaMapMarkerAlt /> {tour.departureLocation || 'Việt Nam'}</span>
            <span aria-hidden="true">·</span>
            <span><FaClock /> {tour.duration || 3} ngày</span>
            {hasSeatCount && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tc-seats">
                  {tour.availableSeats > 0 ? `Còn ${tour.availableSeats} chỗ` : 'Hết chỗ'}
                </span>
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
      <button
        type="button"
        className={`tour-save-btn${saved ? ' is-saved' : ''}`}
        aria-label={saved ? 'Bỏ lưu tour' : 'Lưu tour yêu thích'}
        aria-pressed={saved}
        onClick={() => toggleSaved(tour)}
      >
        <FaHeart aria-hidden="true" /> {saved ? 'Đã lưu' : 'Lưu tour'}
      </button>
    </div>
  );
};

export default TourCard;
