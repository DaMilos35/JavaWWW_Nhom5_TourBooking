import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FallbackImage from '../components/common/FallbackImage';
import { FaTrash, FaShoppingBag } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { hasTourDatePassed } from '../utils/tourDate';
import './CartPage.css';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const hasExpiredTours = items.some((item) => hasTourDatePassed(item.tour.startDate || item.tour.endDate));

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = () => {
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
        <div className="cart-layout">
          <div className="cart-main">
            <div className="table-responsive">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.tour.id || item.tour.tourId}>
                      <td className="product-col">
                        <FallbackImage src={item.tour.imageUrl} alt={item.tour.name} />
                        <div>
                          <Link to={`/tours/${item.tour.id || item.tour.tourId}`} className="tour-name">{item.tour.name || item.tour.tourName}</Link>
                          {hasTourDatePassed(item.tour.startDate || item.tour.endDate) && (
                            <small className="cart-expired-note">Lịch đã qua — xóa khỏi giỏ hoặc cập nhật tour trước khi tiếp tục.</small>
                          )}
                        </div>
                      </td>
                      <td>{formatPrice(item.tour.price)}</td>
                      <td>
                        <div className="qty-controls cart-qty">
                          <button aria-label="Giảm số lượng vé" onClick={() => updateQuantity(item.tour.id || item.tour.tourId, item.quantity - 1)}>-</button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => updateQuantity(item.tour.id || item.tour.tourId, parseInt(e.target.value) || 1)}
                            min="1"
                            max={item.tour.availableSeats}
                          />
                          <button
                            aria-label="Tăng số lượng vé"
                            disabled={item.quantity >= Number(item.tour.availableSeats || 0)}
                            onClick={() => updateQuantity(item.tour.id || item.tour.tourId, item.quantity + 1)}
                          >+</button>
                        </div>
                      </td>
                      <td className="item-total">{formatPrice(item.tour.price * item.quantity)}</td>
                      <td>
                        <button className="btn-delete" onClick={() => removeFromCart(item.tour.id || item.tour.tourId)}>
                          <FaTrash color="red" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
              <button className="btn btn-primary w-100 mt-3 btn-lg" disabled={hasExpiredTours} onClick={handleCheckout}>
                Gửi yêu cầu đặt tour
              </button>
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
