import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FallbackImage from '../components/common/FallbackImage';
import { 
  FaTrash, 
  FaShoppingBag, 
  FaExclamationTriangle,
  FaSearch,
  FaCompass,
  FaMapMarkerAlt,
  FaClock,
  FaFire,
  FaArrowRight
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { hasTourDatePassed } from '../utils/tourDate';
import { REAL_TOURS } from '../api/realTourDataApi';
import { toast } from 'react-toastify';
import './CartPage.css';

const isItemPassed = (item) => {
  const tour = item?.tour || {};
  const chosenDate = tour.selectedDepartureDate || tour.departureDate;
  if (chosenDate) return hasTourDatePassed(chosenDate);
  return tour.endDate ? hasTourDatePassed(tour.endDate) : false;
};

const isItemInactive = (item) => {
  const tour = item?.tour || {};
  const status = tour.status || item.status;
  if (status && status !== 'ACTIVE') return true;
  if (tour.isActive === false || tour.is_active === 0) return true;
  return false;
};

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasExpiredTours = items.some(isItemPassed);
  const hasInactiveTours = items.some(isItemInactive);

  const recommendedTours = useMemo(() => {
    return (REAL_TOURS || [])
      .filter(t => t.status === 'ACTIVE' || t.isActive !== false)
      .slice(0, 3);
  }, []);

  const popularSearches = [
    { label: 'Đà Nẵng - Hội An', query: 'Đà Nẵng' },
    { label: 'Phú Quốc Đảo Ngọc', query: 'Phú Quốc' },
    { label: 'Hạ Long Kỳ Quan', query: 'Hạ Long' },
    { label: 'Đà Lạt Ngàn Hoa', query: 'Đà Lạt' },
    { label: 'Thái Lan Bangkok', query: 'Thái Lan' },
    { label: 'Nhật Bản Mùa Hoa', query: 'Nhật Bản' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
    if (hasInactiveTours) {
      toast.error('Có tour trong giỏ hàng đang tạm ngừng mở bán, vui lòng kiểm tra lại giỏ hàng');
      return;
    }
    if (hasExpiredTours) {
      toast.error('Có tour trong giỏ hàng có lịch khởi hành đã qua, vui lòng kiểm tra lại');
      return;
    }
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/cart' } });
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 empty-cart">
        <div className="text-center empty-cart-hero mb-5">
          <div style={{
            width: '90px',
            height: '90px',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0284c7'
          }}>
            <FaShoppingBag size={44} />
          </div>
          <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Giỏ hàng của bạn đang trống</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.95rem' }}>
            Hãy tìm kiếm và khám phá những hành trình trải nghiệm tuyệt vời cùng Du Lịch Việt.
          </p>
          <Link to="/tours" className="btn btn-primary" style={{ padding: '10px 28px', fontWeight: 600, borderRadius: '8px' }}>
            <FaCompass style={{ marginRight: '8px' }} /> Khám Phá Tour Ngay
          </Link>
        </div>

        {/* Quick Search Links */}
        <div className="empty-cart-searches mb-5" style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
            <FaSearch style={{ color: '#0284c7' }} />
            <span>Tìm kiếm nhanh các điểm đến thịnh hành:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {popularSearches.map((item, idx) => (
              <Link
                key={idx}
                to={`/tours?search=${encodeURIComponent(item.query)}`}
                style={{
                  padding: '7px 14px',
                  background: '#f1f5f9',
                  color: '#334155',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FaMapMarkerAlt style={{ color: '#0284c7', fontSize: '0.75rem' }} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommended Tours Grid */}
        {recommendedTours.length > 0 && (
          <div className="empty-cart-recommendations">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFire style={{ color: '#ea580c' }} /> Gợi Ý Tour Nổi Bật Dành Cho Bạn
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Những hành trình được yêu thích và đặt nhiều nhất trong tuần
                </p>
              </div>
              <Link to="/tours" style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Xem tất cả <FaArrowRight size={12} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {recommendedTours.map((tour) => {
                const tourId = tour.id || tour.tourId;
                return (
                  <div 
                    key={tourId} 
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                      <FallbackImage 
                        src={tour.imageUrl} 
                        alt={tour.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaClock size={11} /> {tour.duration || 3} ngày
                      </span>
                    </div>

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600, marginBottom: '6px' }}>
                        {tour.categoryName || 'Tour Trọn Gói'}
                      </div>
                      <Link 
                        to={`/tours/${tourId}`} 
                        style={{
                          fontSize: '0.98rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          textDecoration: 'none',
                          lineHeight: 1.4,
                          marginBottom: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={tour.name}
                      >
                        {tour.name}
                      </Link>

                      <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Giá từ</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ea580c' }}>
                            {formatPrice(tour.price || 0)}
                          </div>
                        </div>
                        <Link 
                          to={`/tours/${tourId}`} 
                          className="btn btn-outline" 
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                        >
                          Chi Tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="cart-page py-4">
      <div className="container">
        <h2 className="mb-4">GIỎ HÀNG CỦA BẠN</h2>
        {hasInactiveTours && (
          <div className="alert alert-warning mb-3 d-flex align-items-center gap-2" style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px', padding: '12px 16px' }}>
            <FaExclamationTriangle style={{ color: '#d97706', flexShrink: 0 }} />
            <span>Giỏ hàng của bạn có tour đang tạm ngừng mở bán. Vui lòng xóa tour tạm ngừng mở bán để tiến hành đặt chỗ.</span>
          </div>
        )}
        <div className="cart-layout">
          <div className="cart-main">
            <div className="table-responsive">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="col-product">Sản phẩm</th>
                    <th className="col-price">Đơn giá</th>
                    <th className="col-qty">Số lượng</th>
                    <th className="col-total">Thành tiền</th>
                    <th className="col-action">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const tour = item.tour || {};
                    const tourId = tour.id || tour.tourId || item.tourId;
                    const isPassed = isItemPassed(item);
                    const isInactive = isItemInactive(item);
                    const seats = Number(tour.availableSeats || 99);
                    return (
                      <tr key={tourId || Math.random()}>
                        <td className="col-product product-col">
                          <FallbackImage src={tour.imageUrl} alt={tour.name || 'Tour'} />
                          <div className="product-info">
                            <Link to={`/tours/${tourId}`} className="tour-name" title={tour.name || tour.tourName || 'Tour'}>{tour.name || tour.tourName || 'Tour'}</Link>
                            {isInactive && (
                              <div className="mt-1">
                                <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                                  Tạm ngừng mở bán
                                </span>
                                <small className="cart-inactive-note text-danger d-block mt-1" style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                                  Tour này hiện đang tạm ẩn / đóng nhận khách. Vui lòng xóa khỏi giỏ để tiếp tục đặt tour khác.
                                </small>
                              </div>
                            )}
                            {isPassed && (
                              <small className="cart-expired-note">Lịch đã qua — xóa khỏi giỏ hoặc cập nhật tour trước khi tiếp tục.</small>
                            )}
                          </div>
                        </td>
                        <td className="col-price item-price">{formatPrice(tour.price || 0)}</td>
                        <td className="col-qty">
                          <div className="qty-controls cart-qty">
                            <button aria-label="Giảm số lượng vé" onClick={() => updateQuantity(tourId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(tourId, parseInt(e.target.value) || 1)}
                              min="1"
                              max={seats}
                            />
                            <button
                              aria-label="Tăng số lượng vé"
                              disabled={item.quantity >= seats}
                              onClick={() => updateQuantity(tourId, item.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="col-total item-total">{formatPrice((tour.price || 0) * item.quantity)}</td>
                        <td className="col-action">
                          <button
                            type="button"
                            className="btn-delete"
                            aria-label="Xóa tour khỏi giỏ hàng"
                            title="Xóa tour khỏi giỏ hàng"
                            onClick={() => removeFromCart(tourId)}
                          >
                            <FaTrash aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="cart-sidebar">
            <div className="summary-card">
              <h3>Tóm tắt yêu cầu</h3>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="summary-row total-row">
                <span>Tổng giá tour tạm tính:</span>
                <span className="total-price">{formatPrice(getTotal())}</span>
              </div>
              <button className="btn btn-primary w-100 mt-3 btn-lg" disabled={hasExpiredTours || hasInactiveTours} onClick={handleCheckout}>
                Gửi yêu cầu đặt tour
              </button>
              {hasInactiveTours && (
                <p className="cart-checkout-note text-danger mt-2" style={{ color: '#dc2626', fontWeight: 600 }}>
                  Có tour trong giỏ đang tạm ngừng mở bán. Vui lòng xóa tour này để tiếp tục gửi yêu cầu đặt tour.
                </p>
              )}
              {hasExpiredTours && <p className="cart-checkout-note">Không thể gửi yêu cầu cho tour có lịch đã qua. Hãy xóa tour đó khỏi giỏ.</p>}
              <Link to="/tours" className="continue-shopping mt-3 d-block text-center text-primary">
                Tiếp tục xem tour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
