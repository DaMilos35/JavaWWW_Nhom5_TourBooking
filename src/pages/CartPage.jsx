import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FallbackImage from '../components/common/FallbackImage';
import { FaTrash, FaShoppingBag, FaExclamationTriangle } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { hasTourDatePassed } from '../utils/tourDate';
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
      <div className="container py-4 text-center empty-cart">
        <FaShoppingBag size={80} color="#ccc" className="mb-3" />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy tìm và chọn những tour tuyệt vời cho chuyến đi của bạn.</p>
        <Link to="/tours" className="btn btn-primary mt-3">Khám Phá Tour</Link>
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
