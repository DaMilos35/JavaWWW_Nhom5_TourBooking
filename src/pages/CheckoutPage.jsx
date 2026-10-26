import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { hasTourDatePassed } from '../utils/tourDate';
import {
  FaCheckCircle, FaClipboardList, FaArrowLeft, FaEnvelope, FaUser, FaPhone,
  FaMapMarkerAlt, FaCreditCard, FaQrcode, FaShieldAlt, FaTag, FaClock,
  FaTicketAlt, FaPrint, FaCopy, FaCheck, FaLock, FaBuilding, FaFileInvoice,
  FaUsers, FaChevronDown, FaChevronUp, FaInfoCircle, FaCalendarAlt, FaPercent,
  FaArrowRight, FaMoneyBillWave, FaBarcode
} from 'react-icons/fa';
import './CheckoutPage.css';

// Mã giảm giá hợp lệ mô phỏng hệ thống
const AVAILABLE_VOUCHERS = {
  'TRAVELOKA2026': { code: 'TRAVELOKA2026', type: 'PERCENT', value: 10, label: 'Giảm 10% tổng đơn' },
  'DULICHVIET': { code: 'DULICHVIET', type: 'FIXED', value: 200000, label: 'Giảm 200.000₫' },
  'SUMMER500': { code: 'SUMMER500', type: 'FIXED', value: 500000, label: 'Giảm 500.000₫ đơn từ 5 triệu', minSpend: 5000000 },
};

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Thông tin, 2: Thanh toán, 3: Vé E-Ticket
  const [useMyProfile, setUseMyProfile] = useState(true);
  const [isB2bInvoice, setIsB2bInvoice] = useState(false);

  // Nhận diện tài khoản Doanh nghiệp B2B
  const isCorporateAccount = useMemo(() => {
    if (!user) return false;
    const corpKeywords = ['corp', 'group', 'company', 'vietnam', 'vin', 'fpt', 'viettel', 'vcb'];
    const u = (user.username || '').toLowerCase();
    const e = (user.email || '').toLowerCase();
    return corpKeywords.some(kw => u.includes(kw) || e.includes(kw));
  }, [user]);

  // Form liên hệ
  const [formData, setFormData] = useState({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    companyName: '',
    taxId: '',
    notes: '',
  });

  // Tự động điền dữ liệu của riêng từng tài khoản ngay khi load
  useEffect(() => {
    if (user && useMyProfile) {
      setFormData(prev => ({
        ...prev,
        contactName: user.fullName || user.username || '',
        contactPhone: user.phone || '0901234567',
        contactEmail: user.email || '',
        contactAddress: user.address || 'Hồ Chí Minh, Việt Nam',
        companyName: isCorporateAccount ? (user.fullName || 'Tập đoàn Doanh nghiệp') : prev.companyName,
        taxId: isCorporateAccount ? '0312345678' : prev.taxId,
      }));
      if (isCorporateAccount) {
        setIsB2bInvoice(true);
      }
    }
  }, [user, useMyProfile, isCorporateAccount]);

  // Danh sách hành khách đi cùng
  const totalTravelers = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [items]);

  const [passengers, setPassengers] = useState([]);
  useEffect(() => {
    // Khởi tạo danh sách hành khách theo số lượng vé
    const count = Math.max(1, totalTravelers);
    setPassengers(Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: i === 0 && user ? (user.fullName || user.username) : '',
      gender: 'Nam',
      ageGroup: 'Người lớn (> 12 tuổi)'
    })));
  }, [totalTravelers, user]);

  // Đồng hồ đếm ngược giữ chỗ 15 phút
  const [timeLeft, setTimeLeft] = useState(900); // 15 phút
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('VIETQR'); // VIETQR, VNPAY, MOMO, CREDIT_CARD, OFFICE
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  // Voucher
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Trạng thái đơn hàng
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const hasExpiredTours = items.some(item => hasTourDatePassed(item.tour.startDate || item.tour.endDate));

  // Kiểm tra giỏ hàng trống
  useEffect(() => {
    if (!createdOrder && (!items || items.length === 0)) {
      navigate('/cart');
    }
  }, [items, navigate, createdOrder]);

  // Tính toán giá và chiết khấu
  const subTotal = getTotal();

  // Chiết khấu đoàn B2B / Khách đoàn: >=20 người giảm 10%, >=10 người giảm 5%
  const b2bDiscountPercent = useMemo(() => {
    if (totalTravelers >= 20) return 10;
    if (totalTravelers >= 10) return 5;
    return 0;
  }, [totalTravelers]);

  const b2bDiscountAmount = (subTotal * b2bDiscountPercent) / 100;

  // Chiết khấu voucher
  const voucherDiscountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === 'PERCENT') {
      return (subTotal * appliedVoucher.value) / 100;
    }
    return appliedVoucher.value;
  }, [appliedVoucher, subTotal]);

  const finalTotalAmount = Math.max(0, subTotal - b2bDiscountAmount - voucherDiscountAmount);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xử lý Voucher
  const handleApplyVoucher = (e) => {
    e.preventDefault();
    setVoucherError('');
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;

    const voucher = AVAILABLE_VOUCHERS[code];
    if (!voucher) {
      setVoucherError('Mã ưu đãi không tồn tại hoặc đã hết hạn.');
      return;
    }
    if (voucher.minSpend && subTotal < voucher.minSpend) {
      setVoucherError(`Mã này chỉ áp dụng cho đơn từ ${formatPrice(voucher.minSpend)} trở lên.`);
      return;
    }
    setAppliedVoucher(voucher);
    toast.success(`Đã áp dụng mã ưu đãi ${code}: ${voucher.label}!`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError('');
  };

  // Sao chép nhanh số tài khoản / nội dung
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info('Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Bước 1: Tiếp tục đến thanh toán
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!formData.contactName?.trim() || !formData.contactPhone?.trim() || !formData.contactEmail?.trim()) {
      toast.error('Vui lòng cung cấp đầy đủ họ tên, số điện thoại và email nhận vé.');
      return;
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    const cleanPhone = formData.contactPhone.replace(/[\s.-]+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      toast.warning('Số điện thoại không hợp lệ (Vui lòng nhập 10 số di động, VD: 0912345678)');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail.trim())) {
      toast.warning('Địa chỉ email nhận vé điện tử không đúng định dạng.');
      return;
    }

    const emptyPassenger = passengers.find(p => !p.fullName?.trim());
    if (emptyPassenger) {
      toast.warning('Vui lòng điền đầy đủ tên các hành khách trong danh sách.');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bước 2: Tạo đơn và thanh toán
  const handlePlaceOrder = async () => {
    if (hasExpiredTours) {
      toast.error('Tour đã hết hạn khởi hành. Vui lòng kiểm tra lại giỏ hàng.');
      return;
    }

    if (paymentMethod === 'CREDIT_CARD') {
      if (!cardInfo.number?.trim() || !cardInfo.name?.trim() || !cardInfo.expiry?.trim() || !cardInfo.cvv?.trim()) {
        toast.warning('Vui lòng điền đầy đủ số thẻ, tên chủ thẻ, ngày hết hạn và mã CVV.');
        return;
      }
    }

    setLoading(true);
    try {
      const orderPayload = {
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        notes: [
          formData.notes,
          appliedVoucher ? `[Voucher: ${appliedVoucher.code}]` : null,
          `[Phương thức: ${paymentMethod}]`,
          formData.companyName ? `[Doanh nghiệp: ${formData.companyName} | MST: ${formData.taxId}]` : null
        ].filter(Boolean).join(' - '),
        isB2b: isB2bInvoice || b2bDiscountPercent > 0 || isCorporateAccount,
        companyName: isB2bInvoice ? formData.companyName : null,
        taxId: isB2bInvoice ? formData.taxId : null,
        items: items.map(item => ({
          tourId: item.tour.id || item.tour.tourId,
          quantity: item.quantity
        }))
      };

      const res = await orderApi.createOrder(orderPayload);
      const newOrder = res.data;
      setCreatedOrder(newOrder);

      // Nếu thanh toán qua cổng VNPay, chuyển hướng người dùng sang VNPay Gateway:
      if (paymentMethod === 'VNPAY') {
        try {
          const vnpayRes = await paymentApi.createVnPayUrl(newOrder.id, window.location.origin + '/vnpay/return');
          if (vnpayRes && vnpayRes.data && vnpayRes.data.paymentUrl) {
            clearCart();
            window.location.href = vnpayRes.data.paymentUrl;
            return;
          }
        } catch (vnpayErr) {
          console.warn('VnPay create url fallback to direct pay:', vnpayErr);
        }
      }

      // Nếu phương thức thanh toán là trực tuyến (VietQR, VNPAY, MOMO, Thẻ):
      // Xác nhận thanh toán qua API /pay
      if (['VIETQR', 'VNPAY', 'MOMO', 'CREDIT_CARD'].includes(paymentMethod)) {
        try {
          const payRes = await orderApi.payOrder(newOrder.id, {
            paymentMethod: paymentMethod,
            transactionCode: `TXN-${Date.now().toString().slice(-6)}`
          });
          setCreatedOrder(payRes.data);
          setIsPaidSuccess(true);
        } catch (payErr) {
          console.warn('Auto pay confirm fallback:', payErr);
        }
      }

      clearCart();
      setStep(3); // Chuyển sang màn hình E-Ticket
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('Đặt tour và giữ chỗ thành công! Vé điện tử đã được phát hành.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Dữ liệu ngân hàng VietQR
  const bankAccount = {
    bankName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
    accountNumber: '0901234567899',
    accountHolder: 'CONG TY CP DU LICH VIET MEDIA CORP',
    qrUrl: `https://api.vietqr.io/image/970422-0901234567899-compact2.jpg?amount=${finalTotalAmount}&addInfo=DULICHVIET%20${(user?.username || 'GUEST').toUpperCase()}`
  };

  // ==============================================================
  // MÀN HÌNH BƯỚC 3: VÉ ĐIỆN TỬ E-TICKET (BOARDING PASS TRAVELOKA)
  // ==============================================================
  if (step === 3 && createdOrder) {
    return (
      <div className="checkout-page py-5">
        <div className="container" style={{ maxWidth: '820px' }}>
          
          {/* Banner Hoàn Tất */}
          <div className="checkout-success-banner text-center mb-4">
            <div className="success-icon-wrap">
              <FaCheckCircle className="success-icon" />
            </div>
            <h1 className="success-title">ĐẶT CHỖ & XÁC NHẬN THÀNH CÔNG!</h1>
            <p className="success-subtitle">
              Mã đơn hàng: <strong className="highlight-code">{createdOrder.orderCode || `ORD-${createdOrder.id}`}</strong>
              <span className="badge-paid-pill ml-2">
                <FaCheck /> {isPaidSuccess ? 'ĐÃ THANH TOÁN (PAID)' : 'ĐÃ XÁC NHẬN (CONFIRMED)'}
              </span>
            </p>
          </div>

          {/* Vé Điện Tử E-Ticket (Traveloka Flight / Hotel Pass Style) */}
          <div className="eticket-card" id="e-ticket-print">
            {/* Header Vé */}
            <div className="eticket-header">
              <div className="eticket-brand">
                <span className="brand-logo-text">✈️ DU LỊCH VIỆT</span>
                <span className="brand-tag">VÉ ĐIỆN TỬ XÁC NHẬN ĐẶT TOUR (E-TICKET)</span>
              </div>
              <div className="eticket-status-badge">
                <FaShieldAlt /> ĐÃ BẢO LƯU CHỖ NGỒI
              </div>
            </div>

            {/* Thân Vé */}
            <div className="eticket-body">
              <div className="eticket-row">
                <div className="eticket-col">
                  <span className="eticket-label">MÃ ĐƠN HÀNG / BOOKING CODE</span>
                  <span className="eticket-value code-accent">{createdOrder.orderCode || `ORD-${createdOrder.id}`}</span>
                </div>
                <div className="eticket-col">
                  <span className="eticket-label">NGÀY ĐẶT CHỖ</span>
                  <span className="eticket-value">{new Date(createdOrder.orderDate || Date.now()).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="eticket-col">
                  <span className="eticket-label">PHƯƠNG THỨC THANH TOÁN</span>
                  <span className="eticket-value">{paymentMethod}</span>
                </div>
              </div>

              <div className="eticket-divider-dashed"></div>

              {/* Thông tin khách hàng */}
              <div className="eticket-row">
                <div className="eticket-col">
                  <span className="eticket-label">NGƯỜI ĐẠI DIỆN ĐẶT TOUR</span>
                  <span className="eticket-value name-bold">{createdOrder.contactName || user?.fullName}</span>
                </div>
                <div className="eticket-col">
                  <span className="eticket-label">SỐ ĐIỆN THOẠI</span>
                  <span className="eticket-value">{createdOrder.contactPhone || user?.phone}</span>
                </div>
                <div className="eticket-col">
                  <span className="eticket-label">EMAIL NHẬN VÉ</span>
                  <span className="eticket-value">{createdOrder.contactEmail || user?.email}</span>
                </div>
              </div>

              <div className="eticket-divider-dashed"></div>

              {/* Danh sách Tour đã đặt */}
              <div className="eticket-tours-section">
                <span className="eticket-label mb-2 d-block">CHI TIẾT CHUYẾN ĐI ({createdOrder.details?.length || items.length} TOUR)</span>
                {(createdOrder.details && createdOrder.details.length > 0 ? createdOrder.details : items).map((item, idx) => {
                  const t = item.tour || item;
                  return (
                    <div key={idx} className="eticket-tour-item">
                      <div className="tour-thumb-box">
                        <img src={t.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'} alt={t.name} />
                      </div>
                      <div className="tour-info-box">
                        <h4 className="tour-name">{t.name || t.tourName}</h4>
                        <div className="tour-meta-row">
                          <span>📍 Điểm đón: <b>{t.departureLocation || 'TP. Hồ Chí Minh'}</b></span>
                          <span>⏳ Thời lượng: <b>{t.duration || 3} ngày</b></span>
                          <span>👥 Số vé: <b>{item.quantity || 1} khách</b></span>
                        </div>
                      </div>
                      <div className="tour-price-box text-right">
                        <span className="price-tag">{formatPrice((t.price || item.unitPrice) * (item.quantity || 1))}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="eticket-divider-dashed"></div>

              {/* Footer vé: Mã QR tra cứu & Tổng tiền */}
              <div className="eticket-footer-row">
                <div className="barcode-box">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=TOURBOOKING-${createdOrder.orderCode || createdOrder.id}`}
                    alt="Ticket QR Code"
                    className="qr-img"
                  />
                  <div className="barcode-caption">
                    <span>Quét mã QR để xuất trình</span>
                    <strong>{createdOrder.orderCode || `ORD-${createdOrder.id}`}</strong>
                  </div>
                </div>

                <div className="final-amount-box text-right">
                  <span className="final-label">TỔNG TIỀN ĐÃ XÁC NHẬN</span>
                  <span className="final-val">{formatPrice(createdOrder.totalAmount || finalTotalAmount)}</span>
                  <span className="tax-included-note">(Đã bao gồm thuế GTGT & bảo hiểm du lịch)</span>
                </div>
              </div>
            </div>

            {/* Thông báo Email */}
            <div className="eticket-notice">
              <FaEnvelope className="notice-icon" />
              <span>
                Bản vé điện tử chi tiết và hóa đơn GTGT đã được tự động gửi đến hòm thư <b>{createdOrder.contactEmail || user?.email}</b>. Quý khách có thể xuất trình vé trên điện thoại khi lên xe.
              </span>
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="success-actions mt-4">
            <button
              type="button"
              className="btn btn-outline-primary btn-action"
              onClick={() => window.print()}
            >
              <FaPrint /> In Vé / Tải PDF
            </button>
            <Link to="/my-orders" className="btn btn-primary btn-action">
              <FaClipboardList /> Xem Đơn Hàng Của Tôi
            </Link>
            <Link to="/tours" className="btn btn-ghost btn-action">
              <FaArrowLeft /> Khám Phá Thêm Tour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // GIAO DIỆN CHÍNH: CHECKOUT BƯỚC 1 & 2
  // ==============================================================
  return (
    <div className="checkout-page py-4">
      <div className="container">

        {/* Thanh Stepper 3 Bước Thông Minh */}
        <div className="checkout-stepper-wrap mb-4">
          <div className={`stepper-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="stepper-circle">{step > 1 ? <FaCheck /> : '1'}</div>
            <div className="stepper-label">
              <span className="step-num">BƯỚC 1</span>
              <span className="step-name">Thông tin người đặt</span>
            </div>
          </div>
          <div className={`stepper-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`stepper-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="stepper-circle">{step > 2 ? <FaCheck /> : '2'}</div>
            <div className="stepper-label">
              <span className="step-num">BƯỚC 2</span>
              <span className="step-name">Phương thức thanh toán</span>
            </div>
          </div>
          <div className={`stepper-line ${step === 3 ? 'active' : ''}`}></div>
          <div className={`stepper-node ${step === 3 ? 'active' : ''}`}>
            <div className="stepper-circle">3</div>
            <div className="stepper-label">
              <span className="step-num">BƯỚC 3</span>
              <span className="step-name">Vé điện tử E-Ticket</span>
            </div>
          </div>
        </div>

        {/* Banner Đếm Ngược Giữ Chỗ 15 Phút */}
        <div className="booking-countdown-bar mb-4">
          <div className="countdown-content">
            <FaClock className="timer-icon" />
            <div className="timer-text">
              <strong>Chỗ ngồi đang được giữ tạm thời:</strong> Hệ thống giữ giá và chỗ cho bạn trong vòng{' '}
              <span className="timer-badge">{formatTimer(timeLeft)}</span> phút.
            </div>
          </div>
          <div className="countdown-progress-bar">
            <div className="countdown-progress-fill" style={{ width: `${(timeLeft / 900) * 100}%` }}></div>
          </div>
        </div>

        <div className="checkout-layout">
          {/* ========================================================= */}
          {/* CỘT TRÁI: FORM BƯỚC 1 HOẶC BƯỚC 2 */}
          {/* ========================================================= */}
          <div className="checkout-main-col">

            {/* ----------------- BƯỚC 1: THÔNG TIN LIÊN HỆ & HÀNH KHÁCH ----------------- */}
            {step === 1 && (
              <div className="checkout-step-card animate-fade-in">
                {/* Header Card */}
                <div className="card-header-styled">
                  <div className="header-title-box">
                    <span className="step-tag">BƯỚC 1 / 2</span>
                    <h2>Thông Tin Liên Hệ & Hành Khách</h2>
                    <p className="text-muted">Thông tin vé điện tử và hợp đồng lữ hành sẽ được gửi về thông tin này.</p>
                  </div>
                </div>

                {/* Khối Profile Thông Minh Của Tài Khoản */}
                {isAuthenticated && user && (
                  <div className="smart-profile-banner">
                    <div className="profile-badge-row">
                      <div className="user-avatar-circle">
                        {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info-text">
                        <div className="user-name-title">
                          <strong>{user.fullName || user.username}</strong>
                          <span className="vip-tag">
                            {isCorporateAccount ? '🏢 KHÁCH HÀNG DOANH NGHIỆP VIP' : '⭐ THÀNH VIÊN ĐÃ XÁC THỰC'}
                          </span>
                        </div>
                        <span className="user-sub">{user.email} · {user.phone || '0901234567'}</span>
                      </div>
                    </div>

                    <div className="profile-toggle-row">
                      <label className="switch-toggle-label">
                        <input
                          type="checkbox"
                          checked={useMyProfile}
                          onChange={(e) => setUseMyProfile(e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-text">
                          {useMyProfile
                            ? '✓ Sử dụng thông tin tài khoản của tôi (Tự động điền, không cần nhập lại)'
                            : 'Nhập thông tin người liên hệ khác'}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Form thông tin chi tiết */}
                <form onSubmit={handleProceedToPayment} className="checkout-form mt-4">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">
                        <FaUser className="input-icon" /> Họ và tên người liên hệ *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        className="form-input"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="VD: Nguyễn Văn An"
                        required
                        disabled={isAuthenticated && useMyProfile}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaPhone className="input-icon" /> Số điện thoại nhận tin nhắn SMS/Zalo *
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        className="form-input"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="VD: 0901234567"
                        required
                        disabled={isAuthenticated && useMyProfile}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2 mt-3">
                    <div className="form-group">
                      <label className="form-label">
                        <FaEnvelope className="input-icon" /> Địa chỉ Email nhận vé điện tử *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        className="form-input"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="VD: email@example.com"
                        required
                        disabled={isAuthenticated && useMyProfile}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FaMapMarkerAlt className="input-icon" /> Địa chỉ cư trú (Ghi trên hợp đồng du lịch)
                      </label>
                      <input
                        type="text"
                        name="contactAddress"
                        className="form-input"
                        value={formData.contactAddress}
                        onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                        placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                        disabled={isAuthenticated && useMyProfile}
                      />
                    </div>
                  </div>

                  {/* Tùy chọn Xuất hóa đơn VAT Doanh nghiệp */}
                  <div className="b2b-invoice-section mt-4">
                    <label className="checkbox-custom-label">
                      <input
                        type="checkbox"
                        checked={isB2bInvoice}
                        onChange={(e) => setIsB2bInvoice(e.target.checked)}
                      />
                      <span className="checkbox-box"></span>
                      <span className="checkbox-text">
                        <FaFileInvoice className="mr-1 text-primary" /> Yêu cầu xuất hóa đơn đỏ VAT điện tử (Doanh nghiệp / Đoàn thể)
                      </span>
                    </label>

                    {isB2bInvoice && (
                      <div className="invoice-fields-box mt-3 animate-fade-in">
                        <div className="form-grid-2">
                          <div className="form-group">
                            <label className="form-label"><FaBuilding /> Tên công ty / Doanh nghiệp *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              placeholder="VD: Công ty Cổ phần Du Lịch Việt"
                              required={isB2bInvoice}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Mã số thuế doanh nghiệp (MST) *</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.taxId}
                              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                              placeholder="VD: 0312345678"
                              required={isB2bInvoice}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danh sách Hành khách (Passenger Roster) */}
                  <div className="passengers-roster-section mt-4">
                    <div className="roster-header">
                      <h3><FaUsers /> Danh sách hành khách tham gia ({totalTravelers} người)</h3>
                      <span className="roster-sub">Phục vụ mua bảo hiểm lữ hành bắt buộc theo quy định Tổng cục Du Lịch.</span>
                    </div>

                    <div className="passenger-items-list mt-3">
                      {passengers.map((p, idx) => (
                        <div key={p.id} className="passenger-row-item">
                          <div className="passenger-index">Khách {idx + 1}</div>
                          <div className="passenger-name-field">
                            <input
                              type="text"
                              className="form-input form-input-sm"
                              value={p.name}
                              onChange={(e) => {
                                const newP = [...passengers];
                                newP[idx].name = e.target.value;
                                setPassengers(newP);
                              }}
                              placeholder={`Họ và tên hành khách ${idx + 1}`}
                              required
                            />
                          </div>
                          <div className="passenger-gender-field">
                            <select
                              className="form-select form-input-sm"
                              value={p.gender}
                              onChange={(e) => {
                                const newP = [...passengers];
                                newP[idx].gender = e.target.value;
                                setPassengers(newP);
                              }}
                            >
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                            </select>
                          </div>
                          <div className="passenger-age-field">
                            <select
                              className="form-select form-input-sm"
                              value={p.ageGroup}
                              onChange={(e) => {
                                const newP = [...passengers];
                                newP[idx].ageGroup = e.target.value;
                                setPassengers(newP);
                              }}
                            >
                              <option value="Người lớn (> 12 tuổi)">Người lớn (&gt; 12 tuổi)</option>
                              <option value="Trẻ em (5 - 11 tuổi)">Trẻ em (5 - 11 tuổi)</option>
                              <option value="Em bé (< 5 tuổi)">Em bé (&lt; 5 tuổi)</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ghi chú đặc biệt */}
                  <div className="form-group mt-4">
                    <label className="form-label">Yêu cầu đặc biệt cho chuyến đi (nếu có)</label>
                    <textarea
                      className="form-input form-textarea"
                      rows="2"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="VD: Yêu cầu ăn chay, ghế ngồi đầu xe, phòng giường đôi (Double Bed), điểm đón dọc đường..."
                    ></textarea>
                  </div>

                  {/* Nút Chuyển Tiếp Sang Thanh Toán */}
                  <div className="form-action-footer mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-proceed btn-lg w-100"
                    >
                      Tiếp Tục Đến Phương Thức Thanh Toán <FaArrowRight />
                    </button>
                    <span className="ssl-lock-notice">
                      <FaLock /> Thông tin được bảo mật chuẩn mã hóa SSL 256-bit
                    </span>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------- BƯỚC 2: PHƯƠNG THỨC THANH TOÁN ----------------- */}
            {step === 2 && (
              <div className="checkout-step-card animate-fade-in">
                <div className="card-header-styled">
                  <div className="header-title-box">
                    <span className="step-tag">BƯỚC 2 / 2</span>
                    <h2>Chọn Phương Thức Thanh Toán</h2>
                    <p className="text-muted">Chọn phương thức thanh toán an toàn và tiện lợi nhất cho bạn.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setStep(1)}
                  >
                    <FaArrowLeft /> Sửa thông tin
                  </button>
                </div>

                {/* Danh sách các phương thức thanh toán */}
                <div className="payment-options-grid mt-4">

                  {/* 1. VietQR Chuyển Khoản Tức Thì */}
                  <div
                    className={`payment-option-card ${paymentMethod === 'VIETQR' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('VIETQR')}
                  >
                    <div className="option-radio-col">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'VIETQR'}
                        onChange={() => setPaymentMethod('VIETQR')}
                      />
                    </div>
                    <div className="option-info-col">
                      <div className="option-title-row">
                        <span className="option-name">Chuyển khoản Ngân hàng (Quét mã VietQR 24/7)</span>
                        <span className="badge-recommend">KHUYÊN DÙNG · 0đ PHÍ</span>
                      </div>
                      <p className="option-desc">Tự động điền số tiền và nội dung chuyển khoản. Xác nhận tức thì trong 30 giây.</p>
                    </div>
                    <div className="option-logo-col">
                      <FaQrcode className="payment-icon text-primary" />
                    </div>
                  </div>

                  {/* Chi tiết hiển thị khi chọn VietQR */}
                  {paymentMethod === 'VIETQR' && (
                    <div className="vietqr-details-box animate-fade-in">
                      <div className="vietqr-row">
                        <div className="vietqr-image-wrapper">
                          <img src={bankAccount.qrUrl} alt="VietQR Thanh Toán" className="vietqr-img" />
                          <small className="qr-hint">Mở ứng dụng ngân hàng bất kỳ để quét mã</small>
                        </div>
                        <div className="vietqr-info-list">
                          <div className="info-item">
                            <span className="lbl">Ngân hàng thụ hưởng:</span>
                            <span className="val">{bankAccount.bankName}</span>
                          </div>
                          <div className="info-item">
                            <span className="lbl">Số tài khoản:</span>
                            <div className="val-with-copy">
                              <span className="val text-primary font-bold">{bankAccount.accountNumber}</span>
                              <button
                                type="button"
                                className="btn-copy"
                                onClick={() => copyToClipboard(bankAccount.accountNumber, 'acc')}
                              >
                                {copiedKey === 'acc' ? <FaCheck className="text-success" /> : <FaCopy />}
                              </button>
                            </div>
                          </div>
                          <div className="info-item">
                            <span className="lbl">Chủ tài khoản:</span>
                            <span className="val">{bankAccount.accountHolder}</span>
                          </div>
                          <div className="info-item">
                            <span className="lbl">Số tiền thanh toán:</span>
                            <div className="val-with-copy">
                              <span className="val text-danger font-bold text-lg">{formatPrice(finalTotalAmount)}</span>
                              <button
                                type="button"
                                className="btn-copy"
                                onClick={() => copyToClipboard(finalTotalAmount.toString(), 'amount')}
                              >
                                {copiedKey === 'amount' ? <FaCheck className="text-success" /> : <FaCopy />}
                              </button>
                            </div>
                          </div>
                          <div className="info-item">
                            <span className="lbl">Nội dung chuyển khoản:</span>
                            <div className="val-with-copy">
                              <span className="val font-mono font-bold">DULICHVIET {(user?.username || 'GUEST').toUpperCase()}</span>
                              <button
                                type="button"
                                className="btn-copy"
                                onClick={() => copyToClipboard(`DULICHVIET ${(user?.username || 'GUEST').toUpperCase()}`, 'note')}
                              >
                                {copiedKey === 'note' ? <FaCheck className="text-success" /> : <FaCopy />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Cổng Thanh Toán VNPAY */}
                  <div
                    className={`payment-option-card ${paymentMethod === 'VNPAY' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('VNPAY')}
                  >
                    <div className="option-radio-col">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={() => setPaymentMethod('VNPAY')}
                      />
                    </div>
                    <div className="option-info-col">
                      <div className="option-title-row">
                        <span className="option-name">Cổng Thanh Toán Quốc Gia VNPAY-QR</span>
                        <span className="badge-pill-soft">40+ Ngân Hàng</span>
                      </div>
                      <p className="option-desc">Thanh toán qua VNPAY, Agribank, Vietcombank, BIDV, Techcombank, VPBank...</p>
                    </div>
                    <div className="option-logo-col">
                      <span className="brand-pill-vnpay">VNPAY</span>
                    </div>
                  </div>

                  {/* 3. Ví Điện Tử MoMo */}
                  <div
                    className={`payment-option-card ${paymentMethod === 'MOMO' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('MOMO')}
                  >
                    <div className="option-radio-col">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'MOMO'}
                        onChange={() => setPaymentMethod('MOMO')}
                      />
                    </div>
                    <div className="option-info-col">
                      <div className="option-title-row">
                        <span className="option-name">Ví Điện Tử MoMo</span>
                        <span className="badge-pill-soft">Siêu Nhanh</span>
                      </div>
                      <p className="option-desc">Quét mã QR MoMo trên điện thoại hoặc đăng nhập ví.</p>
                    </div>
                    <div className="option-logo-col">
                      <span className="brand-pill-momo">MoMo</span>
                    </div>
                  </div>

                  {/* 4. Thẻ Quốc Tế Visa / MasterCard */}
                  <div
                    className={`payment-option-card ${paymentMethod === 'CREDIT_CARD' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                  >
                    <div className="option-radio-col">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'CREDIT_CARD'}
                        onChange={() => setPaymentMethod('CREDIT_CARD')}
                      />
                    </div>
                    <div className="option-info-col">
                      <div className="option-title-row">
                        <span className="option-name">Thẻ Tín Dụng / Ghi Nợ Quốc Tế (Visa, MasterCard, JCB)</span>
                        <span className="badge-pill-soft">PCI-DSS Level 1</span>
                      </div>
                      <p className="option-desc">Bảo mật mã hóa đầu cuối 3D-Secure OTP.</p>
                    </div>
                    <div className="option-logo-col">
                      <FaCreditCard className="payment-icon text-muted" />
                    </div>
                  </div>

                  {/* Form thẻ quốc tế */}
                  {paymentMethod === 'CREDIT_CARD' && (
                    <div className="credit-card-form-box animate-fade-in">
                      <div className="form-group mb-3">
                        <label className="form-label">Số thẻ (16 chữ số)</label>
                        <input
                          type="text"
                          className="form-input"
                          maxLength="19"
                          value={cardInfo.cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardInfo({ ...cardInfo, cardNumber: val });
                          }}
                          placeholder="4123 4567 8901 2345"
                        />
                      </div>
                      <div className="form-grid-3">
                        <div className="form-group">
                          <label className="form-label">Tên in trên thẻ</label>
                          <input
                            type="text"
                            className="form-input"
                            value={cardInfo.cardHolder}
                            onChange={(e) => setCardInfo({ ...cardInfo, cardHolder: e.target.value.toUpperCase() })}
                            placeholder="NGUYEN VAN AN"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Hạn thẻ (MM/YY)</label>
                          <input
                            type="text"
                            className="form-input"
                            maxLength="5"
                            value={cardInfo.expiry}
                            onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                            placeholder="12/28"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV / CVC</label>
                          <input
                            type="password"
                            className="form-input"
                            maxLength="3"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Thanh toán tại văn phòng */}
                  <div
                    className={`payment-option-card ${paymentMethod === 'OFFICE' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('OFFICE')}
                  >
                    <div className="option-radio-col">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'OFFICE'}
                        onChange={() => setPaymentMethod('OFFICE')}
                      />
                    </div>
                    <div className="option-info-col">
                      <div className="option-title-row">
                        <span className="option-name">Thanh toán tiền mặt tại Văn Phòng Du Lịch Việt</span>
                        <span className="badge-pill-soft">Giữ Chỗ 24h</span>
                      </div>
                      <p className="option-desc">Tới văn phòng TP.HCM / Hà Nội trong vòng 24 giờ để hoàn tất thủ tục vé.</p>
                    </div>
                    <div className="option-logo-col">
                      <FaMoneyBillWave className="payment-icon text-muted" />
                    </div>
                  </div>
                </div>

                {/* Điều khoản & Cam kết */}
                <div className="terms-agreement-box mt-4">
                  <div className="terms-bullet">
                    <FaShieldAlt className="text-primary mr-2" />
                    <span>
                      Bằng việc nhấn <b>"Xác Nhận & Hoàn Tất Đặt Tour"</b>, quý khách đồng ý với{' '}
                      <Link to="/about" target="_blank" className="text-primary underline">Điều khoản dịch vụ & Chính sách hoàn hủy</Link>{' '}
                      của Công ty Du Lịch Việt.
                    </span>
                  </div>
                </div>

                {/* Nút Hoàn tất đặt tour */}
                <div className="form-action-footer mt-4">
                  <button
                    type="button"
                    className="btn btn-primary btn-submit-order btn-lg w-100"
                    disabled={loading || hasExpiredTours}
                    onClick={handlePlaceOrder}
                  >
                    {loading ? (
                      'Đang xử lý đặt chỗ & gửi vé điện tử...'
                    ) : (
                      <>Xác Nhận Đặt Tour & Thanh Toán {formatPrice(finalTotalAmount)}</>
                    )}
                  </button>
                  <div className="return-step-btn mt-2 text-center">
                    <button type="button" className="btn-link-simple" onClick={() => setStep(1)}>
                      <FaArrowLeft /> Quay lại kiểm tra thông tin người đặt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ ƯU ĐÃI (STICKY SIDEBAR) */}
          {/* ========================================================= */}
          <div className="checkout-sidebar-col">
            <div className="checkout-summary-card">
              <div className="summary-card-header">
                <h3>Chi Tiết Chuyến Đi ({items.length} tour)</h3>
                <span className="travelers-badge"><FaUsers /> {totalTravelers} khách</span>
              </div>

              {/* Danh sách các tour trong giỏ */}
              <div className="summary-tours-list">
                {items.map((item) => (
                  <div key={item.tour.id || item.tour.tourId} className="summary-tour-item">
                    <div className="tour-mini-thumb">
                      <img src={item.tour.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=160'} alt={item.tour.name} />
                    </div>
                    <div className="tour-mini-info">
                      <h4 className="tour-mini-name">{item.tour.name || item.tour.tourName}</h4>
                      <div className="tour-mini-meta">
                        <span>Số vé: <b>{item.quantity} người</b></span>
                        <span>Điểm đón: <b>{item.tour.departureLocation || 'TP.HCM'}</b></span>
                      </div>
                      <div className="tour-mini-price">
                        {formatPrice(item.tour.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ô Nhập Voucher / Khuyến Mãi */}
              <div className="voucher-section-box">
                <span className="voucher-title"><FaTag /> Mã Ưu Đãi Khuyến Mãi</span>
                {!appliedVoucher ? (
                  <form onSubmit={handleApplyVoucher} className="voucher-form mt-2">
                    <div className="voucher-input-wrap">
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        placeholder="VD: TRAVELOKA2026, DULICHVIET"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary btn-sm btn-apply-voucher">
                        Áp dụng
                      </button>
                    </div>
                    {voucherError && <small className="text-danger mt-1 d-block">{voucherError}</small>}
                    <div className="voucher-suggestions mt-2">
                      <span className="suggest-hint">Gợi ý mã:</span>
                      <button type="button" className="voucher-pill" onClick={() => setVoucherInput('TRAVELOKA2026')}>TRAVELOKA2026 (-10%)</button>
                      <button type="button" className="voucher-pill" onClick={() => setVoucherInput('DULICHVIET')}>DULICHVIET (-200k)</button>
                    </div>
                  </form>
                ) : (
                  <div className="applied-voucher-banner mt-2">
                    <div className="voucher-applied-info">
                      <FaCheck className="text-success mr-2" />
                      <div>
                        <strong>{appliedVoucher.code}</strong>
                        <small className="d-block text-muted">{appliedVoucher.label}</small>
                      </div>
                    </div>
                    <button type="button" className="btn-remove-voucher" onClick={handleRemoveVoucher}>
                      Gỡ bỏ
                    </button>
                  </div>
                )}
              </div>

              {/* Bảng Kê Chi Tiết Giá (Price Breakdown) */}
              <div className="price-breakdown-table">
                <div className="breakdown-row">
                  <span>Giá vé gốc ({totalTravelers} khách):</span>
                  <span>{formatPrice(subTotal)}</span>
                </div>

                {b2bDiscountAmount > 0 && (
                  <div className="breakdown-row discount-row">
                    <span>
                      <FaPercent className="mr-1 text-success" /> Ưu đãi khách đoàn ({b2bDiscountPercent}%):
                    </span>
                    <span className="text-success font-bold">-{formatPrice(b2bDiscountAmount)}</span>
                  </div>
                )}

                {voucherDiscountAmount > 0 && (
                  <div className="breakdown-row discount-row">
                    <span>
                      <FaTag className="mr-1 text-success" /> Ưu đãi Voucher ({appliedVoucher?.code}):
                    </span>
                    <span className="text-success font-bold">-{formatPrice(voucherDiscountAmount)}</span>
                  </div>
                )}

                <div className="breakdown-row">
                  <span>Phí dịch vụ & Bảo hiểm du lịch:</span>
                  <span className="text-success font-bold">MIỄN PHÍ</span>
                </div>

                <div className="breakdown-divider"></div>

                <div className="breakdown-total-row">
                  <div className="total-label-box">
                    <span className="total-title">TỔNG THANH TOÁN</span>
                    <small className="text-muted">Đã bao gồm toàn bộ thuế & phí</small>
                  </div>
                  <div className="total-amount-box text-right">
                    <span className="final-price-text">{formatPrice(finalTotalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Trust & Guarantees */}
              <div className="trust-badges-list">
                <div className="trust-item">
                  <FaShieldAlt className="trust-ico" />
                  <span>Cam kết giá tốt nhất không phí ẩn</span>
                </div>
                <div className="trust-item">
                  <FaCheckCircle className="trust-ico" />
                  <span>Xác nhận vé điện tử tức thì qua Email</span>
                </div>
                <div className="trust-item">
                  <FaPhone className="trust-ico" />
                  <span>Tổng đài CSKH hỗ trợ 24/7: <b>1900 1234</b></span>
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
