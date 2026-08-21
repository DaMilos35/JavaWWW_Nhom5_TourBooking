import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    contactName: user?.username || '',
    contactPhone: '',
    contactEmail: user?.email || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        ...formData,
        totalAmount: getTotal(),
        items: items.map(item => ({
          tourId: item.tour.id,
          quantity: item.quantity,
          price: item.tour.price
        }))
      };
      await orderApi.createOrder(orderData);
      clearCart();
      toast.success('Đặt tour thành công!');
      navigate('/my-orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt tour');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="checkout-page bg-light py-4">
      <div className="container">
        <h2 className="mb-4">THANH TOÁN ĐƠN HÀNG</h2>
        <div className="checkout-layout">
          <div className="checkout-form-section">
            <div className="card-box">
              <h3>Thông tin liên hệ</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input type="text" name="contactName" className="form-control" value={formData.contactName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input type="tel" name="contactPhone" className="form-control" value={formData.contactPhone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" name="contactEmail" className="form-control" value={formData.contactEmail} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú thêm</label>
                  <textarea name="notes" className="form-control" rows="4" value={formData.notes} onChange={handleChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Tour'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="checkout-sidebar">
            <div className="card-box order-summary">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="order-items">
                {items.map(item => (
                  <div key={item.tour.id} className="summary-item">
                    <div className="item-info">
                      <strong>{item.tour.name}</strong>
                      <div className="text-muted">SL: {item.quantity} x {formatPrice(item.tour.price)}</div>
                    </div>
                    <div className="item-total">
                      {formatPrice(item.tour.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-total mt-3 pt-3 border-top">
                <strong>Tổng thanh toán:</strong>
                <strong className="text-primary" style={{fontSize: '1.2rem'}}>{formatPrice(getTotal())}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
