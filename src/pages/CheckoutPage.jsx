import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasExpiredTours = items.some((item) => hasTourDatePassed(item.tour.startDate || item.tour.endDate));

  const [formData, setFormData] = useState({
    contactName: user?.fullName || user?.username || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Nếu giỏ hàng trống thì quay về trang chủ
  useEffect(() => {
    if (!items || items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  // Tự động điền thông tin nếu người dùng đã đăng nhập
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gửi thông tin đặt tour lên hệ thống
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactName || !formData.contactPhone || !formData.contactEmail) {
      toast.error('Vui lòng điền đầy đủ họ tên, số điện thoại và email!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        notes: formData.notes,
        totalAmount: getTotal(),
        items: items.map(item => ({
          tourId: item.tour.id || item.tour.tourId,
          quantity: item.quantity,
          price: item.tour.price
        }))
      };

      await orderApi.createOrder(orderData);
      clearCart();
      toast.success('Đã gửi yêu cầu đặt tour. Đơn đang chờ xác nhận; hiện chưa phát sinh thanh toán trên website.');
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất đặt tour');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="checkout-page py-5">
      <div className="container">
        <h2 className="mb-4">GỬI YÊU CẦU ĐẶT TOUR</h2>
        
        <div className="checkout-layout">
          {/* Cột trái: Form điền thông tin */}
          <div className="checkout-form-section">
            <h3>Thông tin liên hệ</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="form-label">Họ và tên người liên hệ *</label>
                <input 
                  type="text" 
                  name="contactName" 
                  className="form-control" 
                  value={formData.contactName} 
                  onChange={handleChange} 
                  placeholder="VD: Nguyễn Văn An"
                  required 
                />
              </div>
              
              <div className="form-row mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Số điện thoại liên hệ *</label>
                  <input 
                    type="tel" 
                    name="contactPhone" 
                    className="form-control" 
                    value={formData.contactPhone} 
                    onChange={handleChange} 
                    placeholder="VD: 0901234567"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email liên hệ *</label>
                  <input 
                    type="email" 
                    name="contactEmail" 
                    className="form-control" 
                    value={formData.contactEmail} 
                    onChange={handleChange} 
                    placeholder="email@example.com"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group mb-4">
                <label className="form-label">Yêu cầu đặc biệt / Ghi chú</label>
                <textarea 
                  name="notes" 
                  className="form-control" 
                  rows="3" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Ví dụ: thông tin cần xác nhận về lịch trình, dịch vụ hoặc yêu cầu của đoàn..."
                ></textarea>
              </div>

              <div className="checkout-notice" role="status">
                <strong>{hasExpiredTours ? 'Có tour trong giỏ đã quá ngày khởi hành.' : 'Đây là yêu cầu đặt tour, chưa phải thanh toán.'}</strong>
                <span>
                  {hasExpiredTours
                    ? 'Hãy quay lại giỏ hàng để xóa tour đã hết lịch hoặc cập nhật ngày khởi hành trước khi tiếp tục.'
                    : 'Nhân viên cần xác nhận lịch khởi hành, dịch vụ và điều kiện trước khi bạn thanh toán. Website hiện chưa tích hợp cổng thanh toán.'}
                </span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading || hasExpiredTours} style={{ padding: '14px', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700 }}>
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đặt tour'}
              </button>
            </form>
          </div>
          
          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="checkout-sidebar">
            <h3>Tóm tắt yêu cầu</h3>
            <div className="order-items">
              {items.map(item => {
                const tourId = item.tour.id || item.tour.tourId;
                const tourName = item.tour.name || item.tour.tourName;
                return (
                  <div key={tourId} className="summary-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div className="item-info">
                      <strong>{tourName}</strong>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Số lượng: {item.quantity} vé × {formatPrice(item.tour.price)}
                      </div>
                    </div>
                    <div className="item-total-price" style={{ fontWeight: 700, color: '#0ea5e9', fontSize: '0.95rem' }}>
                      {formatPrice(item.tour.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-total" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
              <div className="total-row-checkout">
                <span>Tổng giá tour tạm tính:</span>
                <span className="price">{formatPrice(getTotal())}</span>
              </div>
              <p className="checkout-total-note">Giá cuối cùng và các dịch vụ đi kèm cần được xác nhận trước khi thanh toán.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
