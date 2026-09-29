import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaQrcode, FaCreditCard, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Dữ liệu biểu mẫu đặt vé
  const [formData, setFormData] = useState({
    contactName: user?.fullName || user?.username || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    paymentMethod: 'VIETQR', // 'VIETQR' | 'VNPAY' | 'CREDIT_CARD' | 'CASH'
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
      const paymentLabel = 
        formData.paymentMethod === 'VIETQR' ? 'Chuyển khoản VietQR' :
        formData.paymentMethod === 'VNPAY' ? 'Cổng thanh toán VNPAY' :
        formData.paymentMethod === 'CREDIT_CARD' ? 'Thẻ Quốc Tế (Visa/Mastercard)' : 'Tiền mặt tại phòng vé';

      const finalNotes = formData.notes 
        ? `${formData.notes} | Hình thức thanh toán: ${paymentLabel}`
        : `Hình thức thanh toán: ${paymentLabel}`;

      const orderData = {
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        notes: finalNotes,
        totalAmount: getTotal(),
        items: items.map(item => ({
          tourId: item.tour.id || item.tour.tourId,
          quantity: item.quantity,
          price: item.tour.price
        }))
      };

      await orderApi.createOrder(orderData);
      clearCart();
      toast.success('Đặt tour thành công! Đội ngũ tư vấn sẽ liên hệ bạn để xác nhận hành trình.');
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
        <h2 className="mb-4" style={{ fontWeight: 800, color: '#0f172a' }}>XÁC NHẬN VÀ THANH TOÁN TOUR</h2>
        
        <div className="checkout-layout">
          {/* Cột trái: Form điền thông tin */}
          <div className="checkout-form-section">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
              1. Thông tin người đại diện đặt vé
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Họ và tên người đại diện *</label>
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
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Số điện thoại liên hệ *</label>
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
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Địa chỉ email nhận vé *</label>
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
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Yêu cầu đặc biệt / Ghi chú</label>
                <textarea 
                  name="notes" 
                  className="form-control" 
                  rows="3" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Yêu cầu về ăn uống (ăn chay, dị ứng), phòng gia đình, ghế ngồi xe đưa đón..."
                ></textarea>
              </div>

              {/* Phần chọn phương thức thanh toán */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', marginTop: '24px' }}>
                2. Phương thức thanh toán
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {[
                  { id: 'VIETQR', icon: <FaQrcode />, title: 'Chuyển khoản ngân hàng VietQR 24/7', desc: 'Quét mã QR từ mọi ứng dụng ngân hàng, xác nhận tự động' },
                  { id: 'VNPAY', icon: <FaCreditCard />, title: 'Cổng VNPAY / Ví điện tử', desc: 'Hỗ trợ thẻ ATM nội địa, thẻ quốc tế và ứng dụng VNPAY' },
                  { id: 'CASH', icon: <FaMoneyBillWave />, title: 'Thanh toán tiền mặt tại văn phòng', desc: 'Thanh toán trực tiếp tại các chi nhánh Du Lịch Việt trên toàn quốc' }
                ].map(method => (
                  <label 
                    key={method.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: formData.paymentMethod === method.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: formData.paymentMethod === method.id ? '#f0f9ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method.id} 
                      checked={formData.paymentMethod === method.id}
                      onChange={handleChange}
                      style={{ accentColor: '#0284c7' }}
                    />
                    <span style={{ fontSize: '1.2rem', color: formData.paymentMethod === method.id ? '#0284c7' : '#64748b' }}>
                      {method.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.92rem', color: '#1e293b' }}>{method.title}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{method.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading} style={{ padding: '14px', borderRadius: '10px', fontSize: '1.05rem', fontWeight: 700 }}>
                {loading ? 'Đang gửi thông tin...' : 'Hoàn Tất Đặt Tour'}
              </button>
            </form>
          </div>
          
          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="checkout-sidebar">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>Tóm tắt đơn hàng</h3>
            <div className="order-items">
              {items.map(item => {
                const tourId = item.tour.id || item.tour.tourId;
                const tourName = item.tour.name || item.tour.tourName;
                return (
                  <div key={tourId} className="summary-item" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div className="item-info">
                      <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{tourName}</strong>
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

            <div className="summary-total" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e2e8f0' }}>
              <div className="total-row-checkout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' }}>Tổng thanh toán:</span>
                <span className="price" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e8400c' }}>{formatPrice(getTotal())}</span>
              </div>
              <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.8rem', background: '#dcfce7', padding: '8px 12px', borderRadius: '6px' }}>
                <FaShieldAlt /> Cam kết giá tốt nhất · Bảo hiểm du lịch trọn gói
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
