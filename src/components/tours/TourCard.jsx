import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import FallbackImage from '../common/FallbackImage';
import { useWishlist } from '../../context/WishlistContext';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const { isSaved, toggleSaved } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const categoryName = tour.category?.name || tour.category?.categoryName || 'Tour Du Lịch';
  const hasSeatCount = tour.availableSeats !== undefined && tour.availableSeats !== null;
  const isAvailable = hasSeatCount ? tour.availableSeats > 0 : true;
  const saved = isSaved(tour);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = toggleSaved(tour);
    if (!ok) {
      navigate('/login', { state: { from: location } });
    }
  };

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

          <h3 className="tc-title" title={tour.name || tour.tourName}>
            {tour.name || tour.tourName}
          </h3>

          {/* Dòng 1: Điểm khởi hành & Thời gian tour (Thẳng hàng) */}
          <div className="tc-meta">
            <span className="tc-meta-item">
              <FaMapMarkerAlt className="meta-icon" />
              <span className="meta-text">{tour.departureLocation || 'Việt Nam'}</span>
            </span>
            <span className="meta-dot">·</span>
            <span className="tc-meta-item">
              <FaClock className="meta-icon" />
              <span className="meta-text">{tour.duration || 3} ngày</span>
            </span>
          </div>

          {/* Dòng 2 riêng biệt: Số chỗ còn lại (Hạ xuống dòng riêng để luôn thẳng hàng trên mọi thẻ) */}
          <div className="tc-seats-row">
            {hasSeatCount ? (
              <span className={`tc-seats-pill ${isAvailable ? 'in-stock' : 'out-of-stock'}`}>
                <span className="seats-status-dot" />
                {isAvailable ? `Còn ${tour.availableSeats} chỗ` : 'Hết chỗ'}
              </span>
            ) : (
              <span className="tc-seats-pill in-stock">
                <span className="seats-status-dot" />
                Còn chỗ mở bán
              </span>
            )}
          </div>

          {/* Footer: Giá & Nút bấm luôn cố định dưới đáy thẻ */}
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
        onClick={handleToggleSave}
      >
        <FaHeart aria-hidden="true" /> {saved ? 'Đã lưu' : 'Lưu tour'}
      </button>
    </div>
  );
};

export default TourCard;
