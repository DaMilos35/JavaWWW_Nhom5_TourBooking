import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUserFriends, FaShoppingCart, FaBolt, FaHeart } from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FallbackImage from '../components/common/FallbackImage';
import { toast } from 'react-toastify';
import { formatTourDate, hasTourDatePassed } from '../utils/tourDate';
import './TourDetailPage.css';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useWishlist();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'services' | 'policy'

  // Tải thông tin chi tiết tour
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourApi.getById(id);
        setTour(res.data);
      } catch (error) {
        toast.error('Không thể tải thông tin tour');
        navigate('/tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, navigate]);

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    addToCart(tour, quantity);
  };

  // Đặt ngay -> chuyển sang trang giỏ hàng / thanh toán
  const handleBuyNow = () => {
    if (addToCart(tour, quantity)) {
      navigate('/checkout');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tour) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  const departureHasPassed = hasTourDatePassed(tour.startDate || tour.endDate);
  const availableSeats = Number(tour.availableSeats) || 0;

  return (
    <div className="tour-detail-page">
      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <div className="td-header mb-4">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Trang chủ</span> {'>'}{' '}
            <span onClick={() => navigate('/tours')}>Khám phá tour</span> {'>'}{' '}
            <span className="active">{tour.name || tour.tourName}</span>
          </div>
          <div className="td-title-row">
            <h1 className="td-title">{tour.name || tour.tourName}</h1>
            <button
              type="button"
              className={`td-save-btn${isSaved(tour) ? ' is-saved' : ''}`}
              aria-pressed={isSaved(tour)}
              onClick={() => {
                const ok = toggleSaved(tour);
                if (!ok) {
                  navigate('/login', { state: { from: location } });
                }
              }}
            >
              <FaHeart aria-hidden="true" />
              {isSaved(tour) ? 'Đã lưu' : 'Lưu tour'}
            </button>
          </div>
          <div className="td-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {tour.category && (
              <span className="badge-cat" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                {tour.category.name || tour.category.categoryName}
              </span>
            )}
            <span className="location" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <FaMapMarkerAlt /> Khởi hành từ: <b style={{ color: 'var(--text-pure)' }}>{tour.departureLocation}</b>
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="td-gallery mb-4">
          <FallbackImage
            src={tour.imageUrl}
            alt={tour.name || tour.tourName} 
            className="main-img" 
          />
        </div>

        {/* Content Layout */}
        <div className="td-layout">
          {/* Main Info */}
          <div className="td-main">
            {/* Quick Highlights Bar */}
            <div className="td-highlights mb-4">
              <div className="hl-item">
                <FaClock className="hl-icon" /> 
                <div className="hl-text">
                  <span>Thời lượng</span>
                  <b>{tour.duration} Ngày {Math.max(1, tour.duration - 1)} Đêm</b>
                </div>
              </div>
              <div className="hl-item">
                <FaCalendarAlt className="hl-icon" /> 
                <div className="hl-text">
                  <span>Lịch khởi hành</span>
                  <b>
                    {formatTourDate(tour.startDate) || 'Chưa cập nhật'}
                    {formatTourDate(tour.endDate) && ` – ${formatTourDate(tour.endDate)}`}
                  </b>
                </div>
              </div>
              <div className="hl-item">
                <FaUserFriends className="hl-icon" /> 
                <div className="hl-text">
                  <span>Chỗ còn trống</span>
                  <b>{availableSeats} chỗ</b>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('itinerary')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'itinerary' ? '2px solid #ff5722' : '2px solid transparent',
                  color: activeTab === 'itinerary' ? '#ff5722' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Thông tin tour
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'services' ? '2px solid #ff5722' : '2px solid transparent',
                  color: activeTab === 'services' ? '#ff5722' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Dịch vụ
              </button>
              <button 
                onClick={() => setActiveTab('policy')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'policy' ? '2px solid #ff5722' : '2px solid transparent',
                  color: activeTab === 'policy' ? '#ff5722' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Đổi / hủy
              </button>
            </div>

            {/* Tab 1: Itinerary */}
            {activeTab === 'itinerary' && (
              <div>
                <div className="td-section mb-4">
                  <h3 style={{ color: 'var(--text-pure)', fontSize: '1.25rem', marginBottom: '12px' }}>Thông tin hành trình</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1rem' }}>
                    {tour.description || 'Chưa có mô tả chi tiết cho tour này.'}
                  </p>
                </div>

                <div className="td-section">
                  <h3 style={{ color: 'var(--text-pure)', fontSize: '1.25rem', marginBottom: '12px' }}>Lịch trình chi tiết</h3>
                  <p className="td-data-note">
                    Lịch trình theo từng ngày chưa được cập nhật. Vui lòng ghi câu hỏi trong phần ghi chú khi gửi yêu cầu đặt tour.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Services */}
            {activeTab === 'services' && (
              <div className="td-data-panel">
                <h3>Thông tin dịch vụ</h3>
                <p>Danh sách dịch vụ bao gồm và chưa bao gồm chưa được cung cấp riêng cho tour này.</p>
                <p>Vui lòng ghi rõ điều cần xác nhận trong phần ghi chú khi gửi yêu cầu đặt tour.</p>
              </div>
            )}

            {/* Tab 3: Policy */}
            {activeTab === 'policy' && (
              <div className="td-data-panel">
                <h3>Điều kiện đặt, đổi và hủy</h3>
                <p>Chính sách đổi/hủy và hoàn tiền chưa được cấu hình trong dữ liệu tour.</p>
                <p>Website hiện ghi nhận yêu cầu đặt tour; nhân viên cần xác nhận lịch, dịch vụ và điều kiện trước khi khách thanh toán.</p>
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="td-sidebar">
            <div className="booking-card">
              <div className="price-box">
                <span className="price">{formatPrice(tour.price)}</span>
                <span className="price-unit">/ 1 vé người lớn</span>
              </div>
              
              <div className="quantity-box">
                <label>Số lượng vé tham gia:</label>
                <div className="qty-controls">
                  <button type="button" aria-label="Giảm số lượng vé" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button
                    type="button"
                    aria-label="Tăng số lượng vé"
                    disabled={quantity >= availableSeats}
                    onClick={() => setQuantity(q => Math.min(availableSeats, q + 1))}
                  >+</button>
                </div>
                <small style={{ color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  {departureHasPassed
                    ? 'Ngày khởi hành đã qua; cần cập nhật lịch trước khi đặt'
                    : availableSeats > 0
                      ? `Còn ${availableSeats} chỗ theo dữ liệu hiện tại`
                      : 'Hiện không còn chỗ'}
                </small>
              </div>

              <div className="total-box">
                <span>Tổng tạm tính:</span>
                <span className="total-price">{formatPrice(tour.price * quantity)}</span>
              </div>

              <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary btn-full" disabled={!availableSeats || departureHasPassed} onClick={handleBuyNow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaBolt /> {departureHasPassed ? 'Lịch khởi hành đã qua' : availableSeats ? 'Gửi yêu cầu đặt tour' : 'Hiện hết chỗ'}
                </button>
                <button className="btn btn-outline btn-full" disabled={!availableSeats || departureHasPassed} onClick={handleAddToCart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaShoppingCart /> {departureHasPassed ? 'Lịch khởi hành đã qua' : availableSeats ? 'Thêm vào giỏ hàng' : 'Hiện hết chỗ'}
                </button>
              </div>
              
              <div className="support-info mt-4" style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Đơn sẽ ở trạng thái chờ xử lý cho đến khi được xác nhận.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
