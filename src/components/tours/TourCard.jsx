import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeart,
  FaMapMarkerAlt,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaPlane,
  FaBus,
  FaShip,
  FaHotel,
  FaBolt,
  FaFire
} from 'react-icons/fa';
import FallbackImage from '../common/FallbackImage';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { getTourImage, formatVehicleChip } from '../../utils/tourImages';
import './TourCard.css';

const TourCard = ({ tour }) => {
  const { isSaved, toggleSaved } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const categoryName = tour.category?.name || tour.category?.categoryName || tour.categoryName || 'Tour Du Lịch';
  const saved = isSaved(tour);
  const seats = Number(tour.availableSeats !== undefined ? tour.availableSeats : 0);
  const price = Number(tour.price || 0);
  const originalPrice = Number(tour.originalPrice || tour.original_price || 0);
  const hasDiscount = originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const badge = tour.badge || (hasDiscount && discountPercent >= 15 ? 'HOT DEAL' : null);
  const hotelStar = tour.hotelStar || tour.hotel_star;
  const vehicle = tour.vehicle;
  const vehicleText = formatVehicleChip(vehicle);
  const imageUrl = getTourImage(tour);

  const getVehicleIcon = (v) => {
    if (!v) return null;
    const lower = v.toLowerCase();
    if (lower.includes('bay') || lower.includes('vietjet') || lower.includes('bamboo') || lower.includes('airlines')) {
      return <FaPlane className="tc-chip-icon" />;
    }
    if (lower.includes('tàu') || lower.includes('du thuyền') || lower.includes('cano') || lower.includes('cruise')) {
      return <FaShip className="tc-chip-icon" />;
    }
    return <FaBus className="tc-chip-icon" />;
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (seats <= 0) {
      toast.warning('Tour này hiện đã hết chỗ nhận khách');
      return;
    }
    addToCart(tour, 1);
  };

  return (
    <div className="tour-card-wrap">
      <Link to={`/tours/${tour.id || tour.tourId}`} className="tour-card">
        <div className="tc-img-wrapper">
          <FallbackImage
            src={imageUrl}
            alt={tour.name || tour.tourName}
            className="tc-img"
            loading="lazy"
          />

          {/* Lớp phủ sáng tạo chiều sâu */}
          <div className="tc-img-overlay" />

          {/* Badges container góc trên trái */}
          <div className="tc-badge-container">
            {badge && (
              <span className={`tc-badge tc-marketing-badge ${badge.includes('HOT') ? 'badge-hot' : badge.includes('CHẠY') ? 'badge-bestseller' : 'badge-premium'}`}>
                {badge.includes('HOT') ? <FaFire className="tc-badge-icon" /> : <FaBolt className="tc-badge-icon" />}
                {badge}
              </span>
            )}
            <span className="tc-badge badge-duration">
              <FaClock style={{ fontSize: '0.65rem' }} /> {tour.duration || 1}N{Math.max(1, (tour.duration || 1) - 1)}Đ
            </span>
          </div>

          {/* Chỉ hiển thị pill khẩn cấp khi chỗ <= 5 hoặc đã hết chỗ */}
          {seats <= 0 ? (
            <div className="tc-seats-corner">
              <span className="tc-status-pill pill-soldout">Hết chỗ</span>
            </div>
          ) : seats <= 5 ? (
            <div className="tc-seats-corner">
              <span className="tc-status-pill pill-urgent">
                <FaBolt className="tc-urgent-icon" aria-hidden="true" /> Chỉ còn {seats} chỗ
              </span>
            </div>
          ) : null}
        </div>

        <div className="tc-content">
          <div className="tc-kicker">
            <span className="tc-category-tag">{categoryName}</span>
            <span className="tc-rating">
              <FaStar className="star-icon" /> {Number(tour.rating || 5).toFixed(1)}
            </span>
          </div>

          <h3 className="tc-title" title={tour.name || tour.tourName}>
            {tour.name || tour.tourName}
          </h3>

          {/* Traveloka Style Features / Chips chống tràn */}
          <div className="tc-amenities-row">
            {vehicleText && (
              <span className="tc-amenity-chip" title={vehicle}>
                {getVehicleIcon(vehicle)} <span>{vehicleText}</span>
              </span>
            )}
            {hotelStar && (
              <span className="tc-amenity-chip">
                <FaHotel className="tc-chip-icon" /> <span>KS {hotelStar}★</span>
              </span>
            )}
            <span className="tc-amenity-chip" title={`Khởi hành từ ${tour.departureLocation || 'Việt Nam'}`}>
              <FaMapMarkerAlt className="tc-chip-icon" /> <span>{tour.departureLocation || 'Việt Nam'}</span>
            </span>
          </div>

          <div className="tc-footer">
            <div className="tc-price-wrap">
              {hasDiscount && (
                <div className="tc-price-top">
                  <span className="tc-original-price">{formatPrice(originalPrice)}</span>
                  <span className="tc-discount-pill">-{discountPercent}%</span>
                </div>
              )}
              <div className="tc-price-row">
                <span className="tc-price">{formatPrice(price)}</span>
                <span className="tc-price-unit">/khách</span>
              </div>
            </div>

            <div className="tc-action-btns">
              <button
                type="button"
                className="btn-quick-add"
                title="Đặt chỗ ngay tour này"
                disabled={seats <= 0}
                onClick={handleQuickAdd}
              >
                <FaShoppingCart /> <span>{seats > 0 ? 'Đặt ngay' : 'Hết chỗ'}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Nút lưu tour yêu thích dạng tròn kính cao cấp */}
      <button
        type="button"
        className={`tour-save-btn${saved ? ' is-saved' : ''}`}
        aria-label={saved ? 'Bỏ lưu tour' : 'Lưu tour yêu thích'}
        aria-pressed={saved}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSaved(tour);
        }}
        title={saved ? 'Đã lưu vào danh sách yêu thích' : 'Lưu tour yêu thích'}
      >
        <FaHeart aria-hidden="true" />
      </button>
    </div>
  );
};

export default TourCard;
