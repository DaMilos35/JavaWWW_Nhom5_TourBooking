import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaMapMarkerAlt, FaClock, FaShoppingCart, FaStar } from 'react-icons/fa';
import FallbackImage from '../common/FallbackImage';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const { isSaved, toggleSaved } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const categoryName = tour.category?.name || tour.category?.categoryName || tour.categoryName || 'Tour Du Lịch';
  const saved = isSaved(tour);
  const seats = Number(tour.availableSeats !== undefined ? tour.availableSeats : 0);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (seats <= 0) {
      toast.warning('Tour này hiện đã hết chỗ nhận khách');
      return;
    }
    addToCart(tour, 1);
    toast.success(`Đã thêm "${tour.name || tour.tourName}" vào giỏ hàng!`);
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
          
          {/* Badge trạng thái chỗ ngồi và thời lượng */}
          <div className="tc-badge-container">
            {seats <= 0 ? (
              <span className="tc-badge badge-full">Hết chỗ</span>
            ) : seats <= 5 ? (
              <span className="tc-badge badge-warning">Chỉ còn {seats} chỗ</span>
            ) : (
              <span className="tc-badge badge-available">Còn {seats} chỗ</span>
            )}
            <span className="tc-badge badge-duration">
              {tour.duration}N{Math.max(1, (tour.duration || 1) - 1)}Đ
            </span>
          </div>
        </div>
        
        <div className="tc-content">
          <div className="tc-kicker">
            <span>{categoryName}</span>
            {tour.rating && (
              <span className="tc-rating">
                <FaStar className="star-icon" /> {tour.rating}
              </span>
            )}
          </div>

          <h3 className="tc-title">{tour.name || tour.tourName}</h3>

          <div className="tc-meta">
            <span><FaMapMarkerAlt /> {tour.departureLocation || 'Việt Nam'}</span>
            <span aria-hidden="true">·</span>
            <span><FaClock /> {tour.duration || 3} ngày</span>
          </div>

          <div className="tc-footer">
            <div className="tc-price-wrap">
              <span className="tc-price-label">Giá trọn gói từ</span>
              <span className="tc-price">{formatPrice(tour.price)}</span>
            </div>
            
            {/* Song song 2 nút: Xem Chi Tiết & Thêm Vào Giỏ */}
            <div className="tc-action-btns">
              <span className="btn-book">Chi tiết</span>
              <button
                type="button"
                className="btn-quick-add"
                title="Đặt chỗ ngay tour này"
                disabled={seats <= 0}
                onClick={handleQuickAdd}
              >
                <FaShoppingCart /> {seats > 0 ? 'Đặt ngay' : 'Hết chỗ'}
              </button>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Nút lưu tour yêu thích */}
      <button
        type="button"
        className={`tour-save-btn${saved ? ' is-saved' : ''}`}
        aria-label={saved ? 'Bỏ lưu tour' : 'Lưu tour yêu thích'}
        aria-pressed={saved}
        onClick={() => toggleSaved(tour)}
      >
        <FaHeart aria-hidden="true" /> {saved ? 'Đã lưu' : 'Lưu'}
      </button>
    </div>
  );
};

export default TourCard;
