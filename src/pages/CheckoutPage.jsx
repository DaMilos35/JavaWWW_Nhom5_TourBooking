import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import { 
  FaCheckCircle, FaClipboardList, FaArrowLeft, FaEnvelope, FaQrcode, 
  FaUniversity, FaCreditCard, FaMoneyBillWave, FaCopy, FaShieldAlt, FaInfoCircle
} from 'react-icons/fa';
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
  const [paymentMethod, setPaymentMethod] = useState('VIETQR'); // 'VIETQR' | 'BANK_TRANSFER' | 'VNPAY' | 'CASH'
  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [confirmingPay, setConfirmingPay] = useState(false);

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

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
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
        paymentMethod: paymentMethod,
        totalAmount: getTotal(),
        items: items.map(item => ({
          tourId: item.tour.id || item.tour.tourId,
          quantity: item.quantity,
          price: item.tour.price
        }))
      };

      const res = await orderApi.createOrder(orderData);
      const created = res.data;
      clearCart(); // Xóa session/giỏ hàng

      // Với VietQR hoặc Bank Transfer, lấy chi tiết thanh toán hiển thị
      if (paymentMethod === 'VIETQR' || paymentMethod === 'BANK_TRANSFER') {
        try {
          const infoRes = await paymentApi.getInfo(created.id);
          setPaymentInfo(infoRes.data);
        } catch (err) {
          console.warn('Could not fetch payment info:', err);
        }
      }

      setCompletedOrder(created);
      toast.success('Đặt tour thành công! Email xác nhận đã được gửi.');
    } catch (error) {
      console.error('Lỗi khi đặt tour:', error, error.response?.data);
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      toast.error(serverMsg || (error.message ? `Lỗi: ${error.message}` : 'Có lỗi xảy ra khi hoàn tất đặt tour'));
    } finally {
      setLoading(false);
    }
  };

  // Nút khách xác nhận đã chuyển khoản xong
  const handleConfirmPaid = async () => {
    if (!completedOrder) return;
    setConfirmingPay(true);
    try {
      const res = await paymentApi.confirm({
        orderId: completedOrder.id,
        paymentMethod: completedOrder.paymentMethod,
        transactionId: 'TXN-' + Date.now().toString().slice(-6)
      });
      setCompletedOrder(res.data);
      toast.success('Đã ghi nhận thanh toán! Đơn hàng của bạn đã được xác nhận (CONFIRMED).');
    } catch (err) {
      toast.error('Có lỗi khi xác nhận thanh toán: ' + (err.response?.data?.message || err.message));
    } finally {
      setConfirmingPay(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Màn hình thông báo Đặt Tour & Thanh Toán
  if (completedOrder) {
    const isPaid = completedOrder.paymentStatus === 'PAID' || completedOrder.status === 'CONFIRMED';

    return (
      <div className="checkout-page py-5">
        <div className="container" style={{ maxWidth: '720px' }}>
          <div style={{
            background: '#1c2434',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            color: '#fff'
          }}>
            <FaCheckCircle style={{ color: '#22c55e', fontSize: '3.5rem', marginBottom: '16px' }} />
            <h2 style={{ color: '#ffffff', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem' }}>
              ĐẶT TOUR THÀNH CÔNG!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 24px' }}>
              Mã đơn hàng: <strong style={{ color: '#38bdf8' }}>#{completedOrder.id}</strong> ({completedOrder.orderCode})
            </p>

            {/* Thông tin đặt chỗ */}
            <div style={{
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: '20px',
              fontSize: '0.95rem'
            }}>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Người liên hệ:</span>
                <strong>{completedOrder.contactName || completedOrder.fullName}</strong>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Số điện thoại:</span>
                <strong>{completedOrder.contactPhone || completedOrder.phone}</strong>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Phương thức:</span>
                <strong style={{ color: '#38bdf8' }}>
                  {completedOrder.paymentMethod === 'VIETQR' ? 'Quét mã VietQR (Napas 24/7)' :
                   completedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' :
                   completedOrder.paymentMethod === 'VNPAY' ? 'Cổng thanh toán VNPay' : 'Tiền mặt tại quầy'}
                </strong>
              </div>
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Trạng thái thanh toán:</span>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700,
                  background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: isPaid ? '#22c55e' : '#eab308'
                }}>
                  {isPaid ? 'ĐÃ THANH TOÁN (CONFIRMED)' : 'CHỜ THANH TOÁN (UNPAID)'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Tổng tiền đơn hàng:</span>
                <strong style={{ color: '#f97316', fontSize: '1.25rem' }}>{formatPrice(completedOrder.totalAmount)}</strong>
              </div>
            </div>

            {/* Khối quét mã VietQR */}
            {(completedOrder.paymentMethod === 'VIETQR' || completedOrder.paymentMethod === 'BANK_TRANSFER') && !isPaid && (
              <div style={{
                background: '#0f172a',
                border: '1px solid #38bdf8',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <h4 style={{ color: '#38bdf8', margin: '0 0 12px', fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaQrcode /> QUÉT MÃ QR HOẶC CHUYỂN KHOẢN THANH TOÁN
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '16px' }}>
                  Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank,...) để quét mã hoặc chuyển khoản:
                </p>

                {paymentInfo?.vietQrUrl && (
                  <div style={{ display: 'inline-block', background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                    <img 
                      src={paymentInfo.vietQrUrl} 
                      alt="VietQR Code" 
                      style={{ maxWidth: '260px', width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}

                <div style={{
                  background: '#1e293b',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  maxWidth: '480px',
                  margin: '0 auto 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Ngân hàng:</span>
                    <strong>{paymentInfo?.bankName || 'MBBank (Quân Đội)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Số tài khoản:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>{paymentInfo?.accountNumber || paymentInfo?.accountNo || '0383687150'}</strong>
                      <button 
                        onClick={() => handleCopy(paymentInfo?.accountNumber || paymentInfo?.accountNo || '0383687150', 'Số tài khoản')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        title="Sao chép số tài khoản"
                      >
                        <FaCopy />
                      </button>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Chủ tài khoản:</span>
                    <strong>{paymentInfo?.accountName || 'CONG TY DU LICH VIET'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Nội dung chuyển khoản:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#22c55e' }}>{paymentInfo?.transferContent || paymentInfo?.transferNote || completedOrder.orderCode}</strong>
                      <button 
                        onClick={() => handleCopy(paymentInfo?.transferContent || paymentInfo?.transferNote || completedOrder.orderCode, 'Nội dung chuyển khoản')}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        title="Sao chép nội dung"
                      >
                        <FaCopy />
                      </button>
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleConfirmPaid}
                  disabled={confirmingPay}
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaCheckCircle /> {confirmingPay ? 'Đang xác nhận...' : 'Tôi Đã Chuyển Khoản Xong'}
                </button>
              </div>
            )}

            {/* Chính sách đặt, đổi và hoàn hủy tour */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <FaShieldAlt style={{ color: '#38bdf8', fontSize: '1.4rem', flexShrink: 0 }} />
                <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>Chính sách đặt, đổi và hoàn hủy tour:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.86rem', lineHeight: 1.65 }}>
                <li><strong style={{ color: '#4ade80' }}>Đơn chưa thanh toán:</strong> Quý khách có thể hủy tour bất cứ lúc nào tại <em>Đơn hàng của tôi</em> hoàn toàn <strong>miễn phí 100%</strong>.</li>
                <li><strong>1. Quy trình đặt tour:</strong> Sau khi gửi yêu cầu trực tuyến, hệ thống sẽ tạm giữ chỗ và gửi email xác nhận. Nhân viên tư vấn sẽ liên hệ để xác nhận thông tin.</li>
                <li><strong>2. Hủy tour trước 7 ngày:</strong> Hoàn trả <strong>100%</strong> số tiền hoặc chuyển đổi sang hành trình khác miễn phí.</li>
                <li><strong>3. Hủy tour từ 3 - 6 ngày:</strong> Phí đổi hủy <strong>30%</strong> giá tour (hoàn lại 70%).</li>
                <li><strong>4. Hủy tour trong vòng 48h trước khởi hành:</strong> Phí đổi hủy <strong>70%</strong> giá tour (hoàn lại 30%).</li>
                <li><strong>5. Trường hợp bất khả kháng:</strong> (Thiên tai, dịch bệnh, hoãn chuyến bay) Du Lịch Việt hỗ trợ dời lịch trình hoặc bảo lưu giá trị tour lên đến <strong>12 tháng</strong>.</li>
              </ul>
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
        <h2 className="mb-4">GỬI YÊU CẦU & THANH TOÁN ĐẶT TOUR</h2>
        
        <div className="checkout-layout">
          {/* Cột trái: Form điền thông tin */}
          <div className="checkout-form-section">
            <h3>1. Thông tin liên hệ nhận vé</h3>

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

              <div className="form-row mb-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                  rows="2" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Yêu cầu đặc biệt về phòng ở, chế độ ăn uống, điểm đón..."
                ></textarea>
              </div>

              {/* 2. CHỌN PHƯƠNG THỨC THANH TOÁN */}
              <h3 style={{ marginTop: '28px' }}>2. Phương thức thanh toán</h3>

              <div className="payment-options-grid" style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {/* VIETQR */}
                <div 
                  className={`payment-option-card ${paymentMethod === 'VIETQR' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('VIETQR')}
                  style={{
                    border: paymentMethod === 'VIETQR' ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'VIETQR' ? 'rgba(14, 165, 233, 0.12)' : '#0f172a',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === 'VIETQR'} 
                    onChange={() => setPaymentMethod('VIETQR')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <FaQrcode style={{ color: '#0ea5e9', fontSize: '1.6rem' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Quét mã QR Code (VietQR Napas 24/7)</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Thanh toán tức thì bằng mọi App ngân hàng qua mã QR chuẩn quốc gia</div>
                    </div>
                  </div>
                  <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    Khuyên dùng
                  </span>
                </div>

                {/* BANK TRANSFER */}
                <div 
                  className={`payment-option-card ${paymentMethod === 'BANK_TRANSFER' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  style={{
                    border: paymentMethod === 'BANK_TRANSFER' ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'BANK_TRANSFER' ? 'rgba(14, 165, 233, 0.12)' : '#0f172a',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === 'BANK_TRANSFER'} 
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <FaUniversity style={{ color: '#10b981', fontSize: '1.6rem' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Chuyển khoản Ngân hàng thủ công</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Chuyển khoản qua số tài khoản MBBank 0383687150 (Chủ TK: CONG TY DU LICH VIET)</div>
                    </div>
                  </div>
                </div>

                {/* CASH */}
                <div 
                  className={`payment-option-card ${paymentMethod === 'CASH' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('CASH')}
                  style={{
                    border: paymentMethod === 'CASH' ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === 'CASH' ? 'rgba(14, 165, 233, 0.12)' : '#0f172a',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === 'CASH'} 
                    onChange={() => setPaymentMethod('CASH')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <FaMoneyBillWave style={{ color: '#eab308', fontSize: '1.6rem' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>Thanh toán tiền mặt tại quầy</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Thanh toán trực tiếp tại văn phòng Du Lịch Việt trước ngày khởi hành</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box giải thích chính sách đặt, đổi và hoàn hủy tour */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '0.84rem',
                color: '#cbd5e1',
                lineHeight: 1.55
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', color: '#38bdf8', fontWeight: 700 }}>
                  <FaInfoCircle style={{ fontSize: '1.1rem', flexShrink: 0 }} />
                  <span>Chính sách đặt, đổi & hoàn hủy tour:</span>
                </div>
                <div style={{ display: 'grid', gap: '4px', paddingLeft: '8px' }}>
                  <div>• <strong>Chưa thanh toán:</strong> Có thể hủy tour bất cứ lúc nào, <strong style={{ color: '#4ade80' }}>miễn phí 100%</strong>.</div>
                  <div>• <strong>Trước 7 ngày:</strong> Hoàn trả <strong>100%</strong> hoặc đổi hành trình miễn phí.</div>
                  <div>• <strong>Từ 3 - 6 ngày:</strong> Phí đổi hủy <strong>30%</strong> giá tour.</div>
                  <div>• <strong>Trong vòng 48h:</strong> Phí đổi hủy <strong>70%</strong> giá tour.</div>
                  <div>• <strong>Bất khả kháng:</strong> Hỗ trợ dời lịch trình hoặc bảo lưu lên đến <strong>12 tháng</strong>.</div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block w-100" 
                disabled={loading || hasExpiredTours}
                style={{ padding: '14px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '10px' }}
              >
                {loading ? 'Đang xử lý đặt tour & thanh toán...' : 
                 paymentMethod === 'VIETQR' ? 'Xác Nhận & Lấy Mã VietQR' : 'Xác Nhận Đặt Tour'}
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
                <span>Tổng thanh toán:</span>
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
