import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import { FaCheckCircle, FaClipboardList, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
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
  const [completedOrder, setCompletedOrder] = useState(null);

  // Nếu giỏ hàng trống và chưa hoàn tất đơn thì quay về trang chủ
  useEffect(() => {
    if (!completedOrder && (!items || items.length === 0)) {
      navigate('/');
    }
  }, [items, navigate, completedOrder]);

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

      const res = await orderApi.createOrder(orderData);
      clearCart(); // Xóa session/giỏ hàng về null ngay sau khi thanh toán thành công
      setCompletedOrder(res.data);
      toast.success('Đặt tour thành công! Email xác nhận đã được gửi tới hòm thư của bạn.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất đặt tour');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Màn hình thông báo Đặt Tour Thành Công
  if (completedOrder) {
    return (
      <div className="checkout-page py-5">
        <div className="container" style={{ maxWidth: '640px' }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <FaCheckCircle style={{ color: '#16a34a', fontSize: '4rem', marginBottom: '16px' }} />
            <h2 style={{ color: '#0f172a', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem' }}>
              ĐẶT TOUR THÀNH CÔNG!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 24px' }}>
              Mã đơn hàng: <strong style={{ color: '#0284c7' }}>#{completedOrder.id}</strong>
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.95rem'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Người liên hệ:</span> <strong>{completedOrder.contactName || completedOrder.fullName}</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Số điện thoại:</span> <strong>{completedOrder.contactPhone || completedOrder.phone}</strong>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Email:</span> <strong>{completedOrder.contactEmail || completedOrder.email}</strong>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Tổng tiền tạm tính:</span>
                <strong style={{ color: '#e8400c', fontSize: '1.15rem' }}>{formatPrice(completedOrder.totalAmount)}</strong>
              </div>
            </div>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <FaEnvelope style={{ color: '#2563eb', fontSize: '1.4rem', flexShrink: 0 }} />
              <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                Email xác nhận đặt tour và hướng dẫn chi tiết đã được gửi tự động đến địa chỉ <strong>{completedOrder.contactEmail || completedOrder.email}</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/my-orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px' }}>
                <FaClipboardList /> Xem Đơn Hàng Của Tôi
              </Link>
              <Link to="/tours" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}>
                <FaArrowLeft /> Tiếp Tục Khám Phá
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  placeholder="Nhập họ và tên đầy đủ"
                  required 
                />
              </div>

              <div className="form-row mb-3">
                <div className="form-group col-md-6">
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
                <div className="form-group col-md-6">
                  <label className="form-label">Địa chỉ Email nhận vé *</label>
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
                <label className="form-label">Ghi chú bổ sung (nếu có)</label>
                <textarea 
                  name="notes" 
                  className="form-control" 
                  rows="3" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Yêu cầu đặc biệt về phòng ở, chế độ ăn uống, điểm đón..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block w-100" 
                disabled={loading || hasExpiredTours}
                style={{ padding: '12px', fontSize: '1.05rem', fontWeight: 700 }}
              >
                {loading ? 'Đang gửi yêu cầu & gửi email xác nhận...' : 'Xác Nhận & Gửi Yêu Cầu Đặt Tour'}
              </button>
            </form>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="checkout-summary-section">
            <div className="summary-card">
              <h3>Tóm tắt đơn hàng ({items.length} tour)</h3>
              
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.tour.id || item.tour.tourId} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-item-title">{item.tour.name || item.tour.tourName}</span>
                      <span className="summary-item-qty">Số lượng: {item.quantity} vé · Khởi hành: {item.tour.departureLocation || 'N/A'}</span>
                    </div>
                    <div className="summary-item-price">
                      {formatPrice(item.tour.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Tổng cộng:</span>
                <span className="total-amount">{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
