import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaHome, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaUserFriends, 
  FaCreditCard, 
  FaPaypal, 
  FaQrcode, 
  FaLock, 
  FaShieldAlt, 
  FaCheck, 
  FaTag, 
  FaInfoCircle,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import FallbackImage from '../components/common/FallbackImage';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    contactName: user?.fullName || user?.username || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    notes: '',
    // Mock card fields
    cardNumber: '9224 1111 2222 3333',
    cardName: 'TRAN MAU TRI TAM',
    expiry: '12 / 28',
    cvc: '888',
    saveCard: true
  });

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/tours');
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || user.fullName || user.username || '',
        contactPhone: prev.contactPhone || user.phone || '',
        contactEmail: prev.contactEmail || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'DULICHVIET' || promoCode.trim().toUpperCase() === 'SALE10') {
      const discountAmount = Math.round(getTotal() * 0.1);
      setDiscount(discountAmount);
      setPromoApplied(true);
      toast.success('Áp dụng mã giảm giá 10% thành công!');
    } else {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const rawTotal = getTotal();
  const finalTotal = Math.max(0, rawTotal - discount);
  const primaryItem = items[0];
  const totalGuests = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactName.trim() || !formData.contactPhone.trim() || !formData.contactEmail.trim()) {
      toast.error('Vui lòng điền đầy đủ họ tên, số điện thoại và email liên hệ.');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        notes: `${formData.notes.trim()}${promoApplied ? ` [Mã giảm giá: ${promoCode}]` : ''} [Hình thức: ${paymentMethod}]`,
        totalAmount: finalTotal,
        items: items.map(item => ({
          tourId: item.tour.id || item.tour.tourId,
          quantity: item.quantity,
          price: item.tour.price
        }))
      };

      const res = await orderApi.createOrder(orderData);
      toast.success('Đặt tour thành công! Đơn hàng của bạn đang được xử lý.');
      clearCart();
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Breadcrumb (Figma: Breadcrumb) */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/"><FaHome /> Trang chủ</Link>
          <span className="separator"><FaChevronRight /></span>
          <Link to="/tours">Trải nghiệm</Link>
          <span className="separator"><FaChevronRight /></span>
          <span className="current">Xác nhận và thanh toán</span>
        </nav>

        {/* Page Title */}
        <div className="checkout-title-wrap">
          <h1 className="checkout-page-title">Xác nhận và thanh toán</h1>
        </div>

        {/* Two-Column Grid */}
        <div className="checkout-layout-grid">
          {/* Left Column: Form Details */}
          <div className="checkout-main-col">
            {/* Trip Info Box (Figma: Chuyến đi của bạn) */}
            <div className="checkout-box">
              <h2 className="box-title">Chuyến đi của bạn</h2>
              <div className="trip-summary-row">
                <div className="trip-info-pill">
                  <div className="pill-icon"><FaCalendarAlt /></div>
                  <div className="pill-content">
                    <span className="pill-label">Lịch khởi hành</span>
                    <strong className="pill-value">
                      {primaryItem?.tour?.startDate ? `${primaryItem.tour.startDate} (${primaryItem.tour.duration} ngày)` : 'Theo lịch trình tour'}
                    </strong>
                  </div>
                </div>

                <div className="trip-info-pill">
                  <div className="pill-icon"><FaUserFriends /></div>
                  <div className="pill-content">
                    <span className="pill-label">Số lượng khách</span>
                    <strong className="pill-value">{totalGuests} khách tham gia</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Section (Figma: Thanh toán bằng) */}
            <div className="checkout-box">
              <h2 className="box-title">Phương thức thanh toán</h2>
              
              <div className="payment-tabs-list">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('credit_card')}
                >
                  <FaCreditCard /> Thẻ tín dụng / Ghi nợ
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <FaPaypal /> Paypal
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'vietqr' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('vietqr')}
                >
                  <FaQrcode /> Chuyển khoản VietQR
                </button>
              </div>

              {/* Payment Details Form */}
              {paymentMethod === 'credit_card' && (
                <div className="payment-form-body">
                  <div className="saved-contact-row">
                    <span>Thông tin liên hệ đã lưu:</span>
                    <strong>{user?.email || 'customer@dulichviet.vn'}</strong>
                  </div>

                  <div className="credit-card-inputs">
                    <div className="form-group">
                      <label className="form-label" htmlFor="cardNumber">Số thẻ tín dụng</label>
                      <div className="input-with-badges">
                        <input 
                          type="text" 
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="9224 1111 2222 3333"
                          className="form-control"
                        />
                        <div className="card-brand-badges">
                          <span className="badge-visa">VISA</span>
                          <span className="badge-mc">MC</span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cardName">Tên chủ thẻ</label>
                      <input 
                        type="text" 
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="TRAN MAU TRI TAM"
                        className="form-control"
                      />
                    </div>

                    <div className="form-row-halves">
                      <div className="form-group">
                        <label className="form-label" htmlFor="expiry">Ngày hết hạn</label>
                        <input 
                          type="text" 
                          id="expiry"
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleChange}
                          placeholder="MM / YY"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="cvc">Mã CVC</label>
                        <input 
                          type="password" 
                          id="cvc"
                          name="cvc"
                          maxLength="4"
                          value={formData.cvc}
                          onChange={handleChange}
                          placeholder="CVC"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <label className="save-card-checkbox">
                      <input 
                        type="checkbox" 
                        name="saveCard" 
                        checked={formData.saveCard} 
                        onChange={handleChange}
                      />
                      <span>Lưu thông tin thẻ cho lần đặt sau an toàn</span>
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="paypal-preview-box">
                  <FaPaypal className="paypal-logo-icon" />
                  <p>Bạn sẽ được chuyển sang cổng thanh toán bảo mật PayPal sau khi bấm xác nhận đơn tour.</p>
                </div>
              )}

              {paymentMethod === 'vietqr' && (
                <div className="vietqr-preview-box">
                  <div className="qr-badge"><FaQrcode /> Quét mã thanh toán</div>
                  <p>Hệ thống tự động hiển thị mã QR chuyển khoản chính xác tới tài khoản ngân hàng sau khi đặt thành công.</p>
                </div>
              )}
            </div>

            {/* Contact Details (Figma: Thông tin liên hệ) */}
            <div className="checkout-box">
              <h2 className="box-title">Thông tin người liên hệ</h2>
              <div className="contact-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactName">Họ và tên *</label>
                  <input 
                    type="text" 
                    id="contactName"
                    name="contactName" 
                    value={formData.contactName} 
                    onChange={handleChange}
                    placeholder="Nguyễn Văn An"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contactPhone">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    id="contactPhone"
                    name="contactPhone" 
                    value={formData.contactPhone} 
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="contactEmail">Email nhận vé và hóa đơn *</label>
                  <input 
                    type="email" 
                    id="contactEmail"
                    name="contactEmail" 
                    value={formData.contactEmail} 
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Message Box (Figma: Lời nhắn cho chủ nhà / đơn vị tổ chức) */}
            <div className="checkout-box">
              <h2 className="box-title">Lời nhắn cho đơn vị tổ chức</h2>
              <div className="form-group">
                <textarea 
                  name="notes" 
                  rows="3" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Tôi sẽ đến muộn khoảng 1 tiếng, xin vui lòng hỗ trợ sắp xếp phòng đôi..."
                  className="form-control textarea-control"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="button" 
              className="btn btn-primary btn-checkout-submit"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Đang tạo đơn đặt...' : 'Xác nhận và đặt tour'}
            </button>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="checkout-sidebar-col">
            <div className="checkout-summary-card">
              {/* Tour Highlight Card */}
              {primaryItem && (
                <div className="summary-tour-preview">
                  <div className="tour-thumb-wrap">
                    <FallbackImage 
                      src={primaryItem.tour.imageUrl} 
                      alt={primaryItem.tour.name || primaryItem.tour.tourName} 
                      className="tour-thumb-img"
                    />
                  </div>
                  <div className="tour-preview-info">
                    <span className="tour-cat-pill">
                      {primaryItem.tour.category?.name || 'Tour Du Lịch'}
                    </span>
                    <h3 className="tour-preview-title">
                      {primaryItem.tour.name || primaryItem.tour.tourName}
                    </h3>
                    <div className="tour-preview-meta">
                      <span><FaMapMarkerAlt /> {primaryItem.tour.departureLocation || 'Việt Nam'}</span>
                      <span>•</span>
                      <span>{primaryItem.tour.duration} ngày</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Items List in Cart */}
              <div className="summary-items-list">
                {items.map((item, index) => (
                  <div key={index} className="summary-item-line">
                    <span className="item-line-name">
                      {item.tour.name || item.tour.tourName} (x{item.quantity})
                    </span>
                    <span className="item-line-price">
                      {formatPrice(item.tour.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              {/* Promo Code Form */}
              <form className="promo-code-box" onSubmit={handleApplyPromo}>
                <div className="promo-input-wrap">
                  <FaTag className="tag-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá..."
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    className="promo-input"
                  />
                  <button 
                    type="submit" 
                    className="btn-apply-promo"
                    disabled={promoApplied}
                  >
                    {promoApplied ? 'Đã áp dụng' : 'Áp dụng'}
                  </button>
                </div>
                {promoApplied && (
                  <div className="promo-success-note">
                    <FaCheck /> Đã giảm {formatPrice(discount)} (10%)
                  </div>
                )}
              </form>

              <div className="summary-divider" />

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Giá tour ban đầu</span>
                  <span>{formatPrice(rawTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="price-row discount-row">
                    <span>Ưu đãi giảm giá</span>
                    <span className="text-accent">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="price-row">
                  <span>Phí dịch vụ & bảo hiểm</span>
                  <span className="free-tag">Miễn phí</span>
                </div>
                <div className="summary-divider" />
                <div className="price-row total-row">
                  <div>
                    <strong>Tổng cộng (VND)</strong>
                    <small>Đã bao gồm VAT & trọn gói</small>
                  </div>
                  <strong className="total-amount-display">{formatPrice(finalTotal)}</strong>
                </div>
              </div>

              {/* Free Cancellation Guarantee Note */}
              <div className="cancellation-policy-note">
                <FaShieldAlt className="shield-icon" />
                <div>
                  <strong>Hủy miễn phí</strong>
                  <p>Hủy hoàn tiền 100% khi đơn còn ở trạng thái chờ xác nhận.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
