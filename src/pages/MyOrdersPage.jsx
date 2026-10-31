import React, { useState, useEffect } from 'react';
import { orderApi, paymentApi } from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  FaChevronDown, FaChevronUp, FaShoppingBag, FaTimesCircle, FaPrint, 
  FaCreditCard, FaQrcode, FaCheckCircle, FaExclamationTriangle, FaCopy, FaUndo,
  FaUniversity, FaClock, FaShieldAlt, FaPlane, FaMapMarkerAlt, FaHeadset, FaAward, FaBuilding,
  FaCoins, FaFileAlt
} from 'react-icons/fa';
import './MyOrdersPage.css';

const POPULAR_BANKS = [
  'MBBank (Quân Đội)',
  'Vietcombank (Ngoại Thương)',
  'Techcombank (Kỹ Thương)',
  'BIDV (Đầu Tư & Phát Triển)',
  'VietinBank (Công Thương)',
  'Agribank (Nông Nghiệp)',
  'ACB (Á Châu)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'TPBank (Tiên Phong)',
  'Sacombank (Sài Gòn Thương Tín)',
  'VIB (Quốc Tế)',
  'HDBank (Phát Triển TP.HCM)',
  'Ngân hàng khác...'
];

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // Modal xem hóa đơn điện tử
  const [paymentModalOrder, setPaymentModalOrder] = useState(null); // Modal quét mã VietQR
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loadingPayInfo, setLoadingPayInfo] = useState(false);

  // Modal hủy tour kèm form điền STK ngân hàng của khách (cho đơn đã thanh toán)
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  // Modal xác nhận hủy tour khi CHƯA THANH TOÁN (Miễn phí 100%)
  const [unpaidCancelModalOrder, setUnpaidCancelModalOrder] = useState(null);
  const [payRemainingModalOrder, setPayRemainingModalOrder] = useState(null);
  const [payingRemaining, setPayingRemaining] = useState(false);

  const handleOpenPayRemaining = (order) => {
    setPayRemainingModalOrder(order);
  };

  const handleConfirmPayRemaining = async () => {
    if (!payRemainingModalOrder) return;
    setPayingRemaining(true);
    try {
      await orderApi.payRemaining(payRemainingModalOrder.id, {
        paymentMethod: 'VIETQR',
        transactionCode: `TXN-REM-${Date.now().toString().slice(-6)}`
      });
      toast.success(`Đã tất toán 100% chuyến đi cho đơn #${payRemainingModalOrder.id}! Chúc quý khách có chuyến du lịch tuyệt vời!`);
      setPayRemainingModalOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi khi tất toán số tiền còn lại');
    } finally {
      setPayingRemaining(false);
    }
  };
  const [refundForm, setRefundForm] = useState({
    bankName: 'MBBank (Quân Đội)',
    accountNumber: '',
    accountName: '',
    reason: ''
  });
  const [cancelling, setCancelling] = useState(false);

  // Tải danh sách đơn hàng của người dùng hiện tại
  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      const data = res.data || [];
      setOrders(data);
      if (data.length > 0 && expandedOrder === null) {
        setExpandedOrder(data[0].id);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.info('Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn');
      } else {
        toast.error('Không thể tải lịch sử đơn hàng: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Mở modal quét VietQR cho đơn chưa thanh toán
  const handleOpenPayment = async (order) => {
    setPaymentModalOrder(order);
    setLoadingPayInfo(true);
    try {
      const res = await paymentApi.getInfo(order.id);
      setPaymentInfo(res.data);
    } catch (err) {
      console.warn('Không tải được thông tin thanh toán:', err);
    } finally {
      setLoadingPayInfo(false);
    }
  };

  // Xác nhận đã thanh toán trong modal
  const handleConfirmModalPaid = async () => {
    if (!paymentModalOrder) return;
    try {
      await paymentApi.confirm({
        orderId: paymentModalOrder.id,
        paymentMethod: 'VIETQR',
        transactionId: 'TXN-' + Date.now().toString().slice(-6)
      });
      toast.success('Đã gửi thông báo chuyển khoản! Ban Quản Trị (Admin) sẽ kiểm tra và xác nhận đơn hàng của bạn.');
      setPaymentModalOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error('Không thể cập nhật thanh toán: ' + (err.response?.data?.message || err.message));
    }
  };

  // Tính toán chính sách đổi hoàn hủy tour dựa trên ngày khởi hành
  const getCancellationPolicy = (order) => {
    let earliestDeparture = null;
    let departureDateStr = null;
    if (order.details && order.details.length > 0) {
      for (const d of order.details) {
        if (d.tour?.startDate) {
          const dDate = new Date(d.tour.startDate);
          if (!earliestDeparture || dDate < earliestDeparture) {
            earliestDeparture = dDate;
            departureDateStr = d.tour.startDate;
          }
        }
      }
    }

    if (!earliestDeparture) {
      return { days: null, percent: 3, refundPercent: 97, departureDateStr: null, canCancel: true, desc: 'Chưa có ngày khởi hành cụ thể (phí xử lý 3%)' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dep = new Date(earliestDeparture);
    dep.setHours(0, 0, 0, 0);
    const diffTime = dep.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { 
        days: 0, 
        percent: 100, 
        refundPercent: 0, 
        departureDateStr, 
        canCancel: false, 
        desc: 'Chuyến đi đang diễn ra hoặc đã hoàn tất (Không thể đổi hủy tour sau ngày khởi hành)' 
      };
    } else if (diffDays >= 7) {
      return { 
        days: diffDays, 
        percent: 0, 
        refundPercent: 100, 
        departureDateStr, 
        canCancel: true, 
        desc: `Hủy trước ≥ 7 ngày (còn ${diffDays} ngày): Hoàn trả 100% (Phí đổi hủy 0%)` 
      };
    } else if (diffDays >= 3) {
      return { 
        days: diffDays, 
        percent: 30, 
        refundPercent: 70, 
        departureDateStr, 
        canCancel: true, 
        desc: `Hủy từ 3 - 6 ngày (còn ${diffDays} ngày): Phí đổi hủy 30% giá tour (Hoàn lại 70%)` 
      };
    } else {
      return { 
        days: Math.max(0, diffDays), 
        percent: 70, 
        refundPercent: 30, 
        departureDateStr, 
        canCancel: true, 
        desc: `Hủy trong vòng 48h trước khởi hành (còn ${diffDays} ngày): Phí đổi hủy 70% giá tour (Hoàn lại 30%)` 
      };
    }
  };

  // Mở modal hủy đơn hàng CHƯA THANH TOÁN (Hoàn toàn miễn phí 100%, không mất chi phí nào)
  const handleCancelUnpaidOrder = (order) => {
    setUnpaidCancelModalOrder(order);
  };

  // Xác nhận hủy đơn hàng chưa thanh toán trong Modal
  const handleConfirmUnpaidCancel = async () => {
    if (!unpaidCancelModalOrder) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(unpaidCancelModalOrder.id, { reason: 'Khách hủy đơn chưa thanh toán' });
      toast.success(`Đã hủy đơn hàng #${unpaidCancelModalOrder.id} thành công (miễn phí 100%). Chỗ ngồi đã được hoàn lại!`);
      setUnpaidCancelModalOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error('Không thể hủy đơn hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setCancelling(false);
    }
  };

  // Bấm hủy tour đã thanh toán: Mở form điền thông tin tài khoản ngân hàng
  const promptCancelOrder = (order) => {
    setCancelModalOrder(order);
    const policy = getCancellationPolicy(order);
    setRefundForm({
      bankName: 'MBBank (Quân Đội)',
      accountNumber: '',
      accountName: (order.fullName || order.contactName || '').toUpperCase(),
      reason: '',
      policy
    });
  };

  // Khách submit form hủy tour đã thanh toán kèm STK ngân hàng
  const handleExecuteCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    if (!refundForm.accountNumber.trim()) {
      toast.error('Vui lòng nhập số tài khoản ngân hàng nhận hoàn tiền!');
      return;
    }
    if (!refundForm.accountName.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản ngân hàng!');
      return;
    }

    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(cancelModalOrder.id, {
        refundBankName: refundForm.bankName,
        refundAccountNumber: refundForm.accountNumber.trim(),
        refundAccountName: refundForm.accountName.trim().toUpperCase(),
        reason: refundForm.reason.trim()
      });

      const feePercent = res.data.cancellationFeePercent ?? (refundForm.policy?.percent || 0);
      const fee = res.data.cancellationFee ?? Math.round(cancelModalOrder.totalAmount * feePercent / 100);
      const refund = res.data.refundAmount ?? (cancelModalOrder.totalAmount - fee);

      if (feePercent === 0) {
        toast.success(`Yêu cầu hủy tour thành công! Bạn hủy trước 7 ngày nên được hoàn trả 100% (${formatPrice(refund)}). Admin sẽ chuyển khoản về STK ${refundForm.accountNumber.trim()}.`);
      } else {
        toast.success(`Yêu cầu hủy tour thành công! Phí hủy ${feePercent}% (-${formatPrice(fee)}). Admin sẽ chuyển khoản hoàn lại ${100 - feePercent}% (${formatPrice(refund)}) về STK ${refundForm.accountNumber.trim()}.`);
      }
      setCancelModalOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng này');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}!`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ Admin xác nhận', bg: '#fef3c7', color: '#b45309' },
      'CONFIRMED': { label: 'Đã xác nhận', bg: '#dcfce7', color: '#15803d' },
      'CANCELLED': { label: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' },
      'COMPLETED': { label: 'Hoàn thành', bg: '#e0f2fe', color: '#0369a1' },
      'DEPOSITED': { label: 'Đã cọc 30%', bg: '#fef3c7', color: '#b45309' }
    };
    const s = statusMap[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color
      }}>
        {s.label}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus, paymentMethod) => {
    const isPaid = paymentStatus === 'PAID';
    const isRefundPending = paymentStatus === 'REFUND_PENDING';
    const isRefunded = paymentStatus === 'REFUNDED';

    let label = 'Chờ Admin xác nhận thanh toán';
    let bg = 'rgba(234, 179, 8, 0.15)';
    let color = '#eab308';

    if (isPaid) {
      label = 'Đã thanh toán (Admin đã duyệt)';
      bg = 'rgba(34, 197, 94, 0.15)';
      color = '#22c55e';
    } else if (isRefundPending) {
      label = 'Chờ Admin hoàn tiền (97%)';
      bg = 'rgba(249, 115, 22, 0.15)';
      color = '#f97316';
    } else if (isRefunded) {
      label = 'Đã hoàn tiền (97%)';
      bg = 'rgba(168, 85, 247, 0.15)';
      color = '#a855f7';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.78rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${color}`
      }}>
        {label} · VietQR
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="my-orders-page py-5">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>LỊCH SỬ ĐẶT TOUR CỦA TÔI</h2>
        </div>

        {/* Banner Chính sách đặt, đổi và hoàn hủy tour */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '26px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.18)',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: 800, fontSize: '1.05rem', marginBottom: '14px' }}>
            <FaShieldAlt style={{ fontSize: '1.3rem' }} />
            <span>Chính Sách Đặt, Đổi & Hoàn Hủy Tour Du Lịch Việt</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '0.86rem', color: '#e2e8f0', lineHeight: 1.55 }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.12)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #22c55e' }}>
              • <strong style={{ color: '#4ade80' }}>Đơn chưa thanh toán:</strong> Hủy tour bất cứ lúc nào, <strong>hoàn toàn miễn phí 100%</strong>.
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              • <strong>1. Quy trình đặt tour:</strong> Tạm giữ chỗ & gửi email xác nhận. Nhân viên tư vấn liên hệ xác nhận.
            </div>
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #38bdf8' }}>
              • <strong>2. Hủy trước 7 ngày:</strong> Hoàn trả <strong>100%</strong> số tiền hoặc đổi hành trình miễn phí.
            </div>
            <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #eab308' }}>
              • <strong>3. Hủy từ 3 - 6 ngày:</strong> Phí đổi hủy <strong>30%</strong> giá tour (hoàn lại 70%).
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              • <strong>4. Hủy trong vòng 48h:</strong> Phí đổi hủy <strong>70%</strong> giá tour (hoàn lại 30%).
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #a855f7' }}>
              • <strong>5. Bất khả kháng:</strong> Dời lịch trình hoặc bảo lưu giá trị lên đến <strong>12 tháng</strong>.
            </div>
          </div>
        </div>
        
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="card-surface text-center py-5" style={{ borderRadius: '16px', padding: '60px 20px' }}>
            <FaShoppingBag size={56} style={{ color: '#64748b', marginBottom: '16px' }} />
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Bạn chưa có đơn đặt tour nào</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Hãy bắt đầu khám phá các chuyến hành trình hấp dẫn và đặt tour ngay hôm nay!
            </p>
            <Link to="/tours" className="btn btn-primary">
              Khám Phá Danh Sách Tour
            </Link>
          </div>
        ) : (
          <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const isExpanded = expandedOrder === order.id;
              const isCancelled = order.status === 'CANCELLED';
              const isDeposited = order.status === 'DEPOSITED' || order.paymentStatus === 'PARTIALLY_PAID';
              const isPaid = order.paymentStatus === 'PAID';
              const isUnpaid = !isPaid && !isDeposited && order.paymentStatus !== 'REFUND_PENDING' && order.paymentStatus !== 'REFUNDED';
              const policy = getCancellationPolicy(order);
              const canCancel = (isPaid || isDeposited) && !isCancelled && order.status !== 'COMPLETED' && policy.canCancel;

              return (
                <div key={order.id} className="order-card" style={{ border: isCancelled ? '1.5px solid #fca5a5' : '1px solid #e2e8f0' }}>
                  <div className="order-header" onClick={() => toggleExpand(order.id)}>
                    <div className="oh-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong>Mã đơn: #{order.id}</strong>
                        {order.orderCode && <span style={{ color: '#38bdf8', fontSize: '0.82rem' }}>({order.orderCode})</span>}
                        {getPaymentBadge(order.paymentStatus, order.paymentMethod)}
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
                        Ngày đặt: {formatDate(order.createdAt || order.orderDate)}
                      </span>
                    </div>
                    <div className="oh-status">
                      {getStatusBadge(order.status)}
                      <span className="order-total">{formatPrice(order.totalAmount)}</span>
                      <button 
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 600,
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isExpanded ? <>Thu gọn <FaChevronUp /></> : <>Chi tiết <FaChevronDown /></>}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="order-details">
                      <h4 style={{ color: '#0f172a', margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>Chi tiết các tour đã đặt:</h4>
                      <ul className="order-items-list">
                        {order.orderDetails?.map(detail => {
                          const tourName = detail.tour?.name || detail.tour?.tourName || 'Tour du lịch';
                          const unitPrice = detail.price || detail.unitPrice || 0;
                          return (
                            <li key={detail.id || detail.orderDetailId} className="order-item-row">
                              <span className="oi-name">{tourName}</span>
                              <span className="oi-qty">Số lượng: {detail.quantity} vé</span>
                              <span className="oi-price">{formatPrice(unitPrice * detail.quantity)}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {/* BENTO TRACKER: TIẾN ĐỘ ĐẶT CỌC & TẤT TOÁN */}
                      {isDeposited && (
                        <div style={{
                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                          border: '1.5px solid #fde68a',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ fontWeight: 800, color: '#b45309', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCoins /> TIẾN ĐỘ ĐẶT CỌC & THANH TOÁN (INSTALLMENT TRACKER):
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.88rem' }}>
                            <div>
                              <span style={{ color: '#78350f', display: 'block' }}>Đợt 1 (Đã cọc 30%):</span>
                              <strong style={{ color: '#15803d', fontSize: '1.05rem' }}>
                                {formatPrice(order.depositAmount || (order.totalAmount * 0.3))} (Đã nộp)
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: '#78350f', display: 'block' }}>Đợt 2 (Còn lại 70%):</span>
                              <strong style={{ color: '#dc2626', fontSize: '1.05rem' }}>
                                {formatPrice(order.remainingAmount || (order.totalAmount * 0.7))}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: '#78350f', display: 'block' }}>Hạn chót tất toán:</span>
                              <strong style={{ color: '#0f172a' }}>
                                {order.depositDeadline ? formatDate(order.depositDeadline) : 'Trước ngày khởi hành 7 ngày'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="order-contact-box" style={{ marginBottom: '16px' }}>
                        <p><strong>Người liên hệ:</strong> {order.fullName || order.contactName}</p>
                        <p><strong>Số điện thoại:</strong> {order.phone || order.contactPhone}</p>
                        <p><strong>Email nhận vé:</strong> {order.email || order.contactEmail}</p>
                        <p><strong>Phương thức:</strong> Quét mã VietQR (Napas 24/7)</p>
                        <p><strong>Trạng thái thanh toán:</strong> {
                          order.paymentStatus === 'PAID' ? 'Đã thanh toán (Admin đã duyệt)' :
                          order.paymentStatus === 'REFUND_PENDING' ? 'Chờ Admin hoàn tiền 97%' :
                          order.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền thành công' :
                          'Chưa thanh toán / Chờ Admin xác nhận chuyển khoản'
                        }</p>
                        <p><strong>Ghi chú:</strong> {order.notes || 'Không có ghi chú'}</p>
                      </div>

                      {/* Hiển thị chi tiết khấu trừ và thông tin STK nhận tiền nếu đơn đã hủy */}
                      {isCancelled && (order.cancellationFee > 0 || order.refundAmount > 0) && (
                        <div style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          padding: '18px',
                          marginBottom: '16px',
                          fontSize: '0.9rem',
                          color: '#991b1b'
                        }}>
                          <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUndo /> THÔNG TIN HOÀN TIỀN VÉ ĐÃ HỦY:
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#334155' }}>
                            <span>Tổng giá trị đơn ban đầu:</span>
                            <strong>{formatPrice(order.totalAmount)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#b91c1c' }}>
                            <span>Phí đổi hủy áp dụng ({order.cancellationFeePercent ?? 0}%):</span>
                            <strong>-{formatPrice(order.cancellationFee ?? 0)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #fca5a5', paddingTop: '8px', marginTop: '6px', color: '#15803d', fontWeight: 700 }}>
                            <span>Số tiền Admin chuyển khoản hoàn lại ({100 - (order.cancellationFeePercent ?? 0)}%):</span>
                            <span>{formatPrice(order.refundAmount ?? 0)}</span>
                          </div>

                          {order.refundAccountNumber && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #fecaca', color: '#334155', fontSize: '0.85rem' }}>
                              <div><strong>Tài khoản nhận tiền:</strong> {order.refundAccountNumber} - {order.refundBankName}</div>
                              <div><strong>Chủ tài khoản:</strong> {order.refundAccountName}</div>
                              {order.cancellationReason && <div><strong>Lý do hủy:</strong> {order.cancellationReason}</div>}
                              <div style={{ marginTop: '4px', color: order.paymentStatus === 'REFUNDED' ? '#15803d' : '#b45309', fontWeight: 600 }}>
                                {order.paymentStatus === 'REFUNDED' 
                                  ? 'Ban Quản Trị đã hoàn tất chuyển tiền hoàn lại cho bạn.' 
                                  : <><FaClock aria-hidden="true" style={{ marginRight: '6px' }} /> Đang chờ Ban Quản Trị chuyển khoản hoàn tiền vào tài khoản trên.</>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hiển thị đơn hủy miễn phí (khi chưa thanh toán) */}
                      {isCancelled && (!order.cancellationFee || order.cancellationFee === 0) && (!order.refundAmount || order.refundAmount === 0) && (
                        <div style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '12px',
                          padding: '16px 20px',
                          marginBottom: '16px',
                          fontSize: '0.9rem',
                          color: '#166534'
                        }}>
                          <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCheckCircle /> ĐÃ HỦY ĐƠN HÀNG THÀNH CÔNG (MIỄN PHÍ 100%)
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            Đơn hàng được hủy khi chưa thanh toán, không phát sinh chi phí nào và toàn bộ số chỗ ngồi đã được hoàn lại hệ thống.
                          </div>
                          {order.cancellationReason && (
                            <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>
                              <strong>Lý do hủy:</strong> {order.cancellationReason}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons inside order card */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Nút thanh toán VietQR và Nút HỦY MIỄN PHÍ nếu chưa thanh toán và chưa hủy */}
                        {isUnpaid && !isCancelled && (
                          <>
                            <button 
                              onClick={() => handleOpenPayment(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <FaQrcode /> Quét Mã VietQR Thanh Toán
                            </button>

                            <button 
                              onClick={() => handleCancelUnpaidOrder(order)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Hủy đơn chưa thanh toán (Miễn phí 100%)"
                            >
                              <FaTimesCircle /> Hủy Đơn Tour (Miễn Phí)
                            </button>
                          </>
                        )}

                        <button 
                          onClick={() => setInvoiceOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FaPrint /> Xem Phiếu Xác Nhận Tour
                        </button>
                        
                        {/* Khi đã thanh toán và Admin xác nhận: Nút Hủy Tour có hoàn tiền theo chính sách */}
                        {canCancel ? (
                          <button 
                            onClick={() => promptCancelOrder(order)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <FaTimesCircle /> Hủy Tour & Nhận Hoàn Tiền
                          </button>
                        ) : ((isPaid || isDeposited) && !isCancelled && order.status !== 'COMPLETED' && (
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontSize: '0.8rem',
                              fontWeight: 500
                            }}
                            title={policy.desc}
                          >
                            <FaInfoCircle style={{ color: '#94a3b8' }} /> Đã qua ngày khởi hành
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Quét mã VietQR thanh toán ngay */}
      {paymentModalOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', color: '#0f172a', padding: '32px 28px',
            borderRadius: '20px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', textAlign: 'center', border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 6px', color: '#0194f3', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
              QUÉT MÃ VIETQR THANH TOÁN
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Đơn hàng: <strong>{paymentModalOrder.orderCode || '#' + paymentModalOrder.id}</strong> · Tổng tiền: <strong style={{ color: '#f97316' }}>{formatPrice(paymentModalOrder.totalAmount)}</strong>
            </p>

            {loadingPayInfo ? (
              <div style={{ padding: '30px' }}><LoadingSpinner /></div>
            ) : (
              <>
                {paymentInfo?.vietQrUrl && (
                  <div style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '14px' }}>
                    <img 
                      src={paymentInfo.vietQrUrl} 
                      alt="VietQR" 
                      style={{ maxWidth: '240px', width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                )}

                <div style={{
                  background: '#f8fafc', borderRadius: '12px', padding: '14px 18px', border: '1px solid #e2e8f0',
                  textAlign: 'left', fontSize: '0.9rem', marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                    <strong>{paymentInfo?.bankName || 'MBBank (Quân Đội)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: '#0194f3', fontFamily: 'monospace', fontSize: '1.05rem' }}>{paymentInfo?.accountNumber || '0383687150'}</strong>
                      <button onClick={() => handleCopy(paymentInfo?.accountNumber || '0383687150', 'Số tài khoản')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FaCopy /></button>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                    <strong>{paymentInfo?.accountName || 'CONG TY DU LICH VIET'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: '#15803d', fontFamily: 'monospace' }}>{paymentInfo?.transferContent || paymentModalOrder.orderCode}</strong>
                      <button onClick={() => handleCopy(paymentInfo?.transferContent || paymentModalOrder.orderCode, 'Nội dung')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><FaCopy /></button>
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
                  * Lưu ý: Sau khi bạn chuyển khoản, Admin sẽ kiểm tra và xác nhận thanh toán. Sau khi được duyệt, nút <strong>Hủy Tour</strong> sẽ xuất hiện nếu quý khách có nhu cầu.
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    onClick={handleConfirmModalPaid}
                    style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaCheckCircle /> Tôi Đã Chuyển Khoản Xong
                  </button>
                  <button 
                    onClick={() => setPaymentModalOrder(null)}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Form điền thông tin tài khoản ngân hàng để Admin hoàn tiền (Khấu trừ 3%) */}
      {cancelModalOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', color: '#0f172a', padding: '32px',
            borderRadius: '20px', width: '100%', maxWidth: '540px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #e2e8f0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <FaUniversity style={{ color: '#ef4444', fontSize: '2.5rem', marginBottom: '8px' }} />
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: 800 }}>
                YÊU CẦU HỦY TOUR #{cancelModalOrder.id}
              </h3>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                Điền thông tin tài khoản ngân hàng để Ban Quản Trị chuyển khoản hoàn lại tiền cho bạn
              </p>
            </div>

            {/* Bảng tính hoàn tiền theo chính sách ngày khởi hành */}
            {(() => {
              const pol = refundForm.policy || getCancellationPolicy(cancelModalOrder);
              const isPartiallyPaid = cancelModalOrder.status === 'DEPOSITED' || cancelModalOrder.paymentStatus === 'PARTIALLY_PAID';
              const paidAmount = isPartiallyPaid
                ? (cancelModalOrder.depositAmount || cancelModalOrder.deposit_amount || 0)
                : cancelModalOrder.totalAmount;
              const feeAmount = Math.round(paidAmount * (pol.percent / 100));
              const refundAmount = Math.max(0, paidAmount - feeAmount);
              return (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', marginBottom: '20px', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {pol.departureDateStr && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ color: '#94a3b8' }}>Ngày khởi hành:</span>
                      <strong style={{ color: '#38bdf8' }}>{formatDate(pol.departureDateStr)} (còn {pol.days} ngày)</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>Áp dụng chính sách:</span>
                    <strong style={{ color: pol.percent === 0 ? '#4ade80' : pol.percent === 30 ? '#facc15' : '#f87171' }}>
                      {pol.percent === 0 ? 'Hủy trước ≥ 7 ngày (Phí 0%)' : pol.percent === 30 ? 'Hủy từ 3 - 6 ngày (Phí 30%)' : 'Hủy trong vòng 48h (Phí 70%)'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Số tiền thực tế đã đóng:</span>
                    <strong style={{ color: '#0f172a' }}>{formatPrice(paidAmount)} {isPartiallyPaid ? `(Đặt cọc ${cancelModalOrder.depositPercent || 30}%)` : '(100% trọn gói)'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: pol.percent === 0 ? '#4ade80' : '#f87171' }}>
                    <span>Phí đổi hủy áp dụng ({pol.percent}%):</span>
                    <strong>{pol.percent === 0 ? '0 đ (Miễn phí 100%)' : `-${formatPrice(feeAmount)}`}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255, 255, 255, 0.2)', paddingTop: '8px', marginTop: '6px', color: '#86efac', fontWeight: 700, fontSize: '0.95rem' }}>
                    <span>Số tiền hoàn lại ({pol.refundPercent}%):</span>
                    <span style={{ fontSize: '1.05rem', color: '#4ade80' }}>{formatPrice(refundAmount)}</span>
                  </div>

                  {/* Tóm tắt 5 chính sách quy định */}
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}><FaFileAlt style={{ color: '#0194F3', marginRight: '6px' }} /> Chính sách hủy đổi tour Du Lịch Việt:</div>
                    <div>• <strong>Trước 7 ngày:</strong> Hoàn 100% hoặc đổi hành trình miễn phí.</div>
                    <div>• <strong>Từ 3 - 6 ngày:</strong> Phí đổi hủy 30% giá tour.</div>
                    <div>• <strong>Trong vòng 48h:</strong> Phí đổi hủy 70% giá tour.</div>
                    <div>• <strong>Bất khả kháng:</strong> Dời lịch trình hoặc bảo lưu lên đến 12 tháng.</div>
                  </div>
                </div>
              );
            })()}

            {/* Form điền STK */}
            <form onSubmit={handleExecuteCancel}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tên Ngân Hàng Thụ Hưởng *
                </label>
                <select 
                  value={refundForm.bankName}
                  onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', background: '#ffffff',
                    color: '#0f172a', fontSize: '0.9rem'
                  }}
                  required
                >
                  {POPULAR_BANKS.map(b => (
                    <option key={b} value={b} style={{ background: '#ffffff', color: '#0f172a' }}>{b}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Số Tài Khoản Ngân Hàng *
                </label>
                <input 
                  type="text" 
                  value={refundForm.accountNumber}
                  onChange={(e) => setRefundForm({ ...refundForm, accountNumber: e.target.value })}
                  placeholder="Nhập số tài khoản ngân hàng của bạn"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', background: '#ffffff',
                    color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Tên Chủ Tài Khoản (Viết hoa không dấu) *
                </label>
                <input 
                  type="text" 
                  value={refundForm.accountName}
                  onChange={(e) => setRefundForm({ ...refundForm, accountName: e.target.value.toUpperCase() })}
                  placeholder="VD: NGUYEN VAN A"
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', background: '#ffffff',
                    color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box', textTransform: 'uppercase'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Lý do hủy tour (tùy chọn)
                </label>
                <textarea 
                  rows="2"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="VD: Có việc gia đình bận đột xuất..."
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: '8px',
                    border: '1.5px solid #cbd5e1', background: '#ffffff',
                    color: '#0f172a', fontSize: '0.88rem', boxSizing: 'border-box'
                  }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  disabled={cancelling}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Đóng lại
                </button>
                <button 
                  type="submit" 
                  disabled={cancelling || (refundForm.policy && !refundForm.policy.canCancel)}
                  style={{ 
                    padding: '10px 22px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: (refundForm.policy && !refundForm.policy.canCancel) ? '#94a3b8' : '#dc2626', 
                    color: '#fff', 
                    fontWeight: 700, 
                    cursor: (refundForm.policy && !refundForm.policy.canCancel) ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  {cancelling ? 'Đang gửi...' : 'Xác Nhận Hủy Tour & Gửi Thông Tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.5: Xác nhận hủy tour khi CHƯA THANH TOÁN (Miễn phí 100%) */}
      {unpaidCancelModalOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)',
          zIndex: 1060, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', color: '#0f172a', padding: '32px',
            borderRadius: '20px', width: '100%', maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', textAlign: 'center', border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', margin: '0 auto 16px'
            }}>
              <FaCheckCircle />
            </div>

            <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.35rem', fontWeight: 800 }}>
              XÁC NHẬN HỦY ĐƠN HÀNG #{unpaidCancelModalOrder.id}
            </h3>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '0.9rem',
              color: '#166534',
              lineHeight: 1.6
            }}>
              <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                Hủy Miễn Phí 100% Không Mất Phí Nào
              </div>
              <div>Vì đơn hàng này <strong>chưa thanh toán</strong>, quý khách sẽ <strong>không mất bất kỳ khoản phí nào</strong> (phí đổi hủy 0 đ).</div>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                Số chỗ ngồi của tour sẽ lập tức được hoàn trả về hệ thống để phục vụ các khách hàng khác.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                disabled={cancelling}
                onClick={handleConfirmUnpaidCancel}
                style={{
                  background: '#ef4444', color: '#fff', border: 'none',
                  padding: '11px 22px', borderRadius: '8px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.92rem'
                }}
              >
                {cancelling ? 'Đang hủy...' : 'Xác Nhận Hủy Đơn'}
              </button>
              <button
                disabled={cancelling}
                onClick={() => setUnpaidCancelModalOrder(null)}
                style={{
                  padding: '11px 20px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
                  color: '#cbd5e1', cursor: 'pointer', fontWeight: 600,
                  fontSize: '0.92rem'
                }}
              >
                Giữ Lại Đơn Hàng
              </button>
            </div>
          </div>
        </div>
      )}
      {invoiceOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            color: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.4rem', fontWeight: 800 }}>DU LỊCH VIỆT</h3>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>PHIẾU XÁC NHẬN ĐẶT TOUR ĐIỆN TỬ</p>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Mã đơn: #{invoiceOrder.id} ({invoiceOrder.orderCode}) · Ngày lập: {formatDate(invoiceOrder.createdAt || invoiceOrder.orderDate)}</div>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div><strong>Họ tên khách hàng:</strong> {invoiceOrder.fullName || invoiceOrder.contactName}</div>
              <div><strong>Số điện thoại:</strong> {invoiceOrder.phone || invoiceOrder.contactPhone}</div>
              <div><strong>Email:</strong> {invoiceOrder.email || invoiceOrder.contactEmail}</div>
              <div><strong>Phương thức thanh toán:</strong> Quét mã VietQR (Napas 24/7)</div>
              <div><strong>Trạng thái thanh toán:</strong> {invoiceOrder.paymentStatus === 'PAID' ? 'Đã thanh toán (Admin đã duyệt)' : invoiceOrder.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền (REFUNDED)' : 'Chờ xác nhận thanh toán'}</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', marginBottom: '20px' }}>
              {invoiceOrder.orderDetails?.map(d => (
                <div key={d.id || d.orderDetailId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>{d.tour?.name || d.tour?.tourName} (x{d.quantity})</span>
                  <span style={{ fontWeight: 700 }}>{formatPrice((d.price || d.unitPrice) * d.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <strong style={{ fontSize: '1.1rem' }}>TỔNG THANH TOÁN:</strong>
              <strong style={{ fontSize: '1.3rem', color: '#e8400c' }}>{formatPrice(invoiceOrder.totalAmount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setInvoiceOrder(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button 
                onClick={() => window.print()}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPrint /> In Phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
