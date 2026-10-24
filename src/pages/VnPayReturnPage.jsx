import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentApi } from '../api/axiosConfig';
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaHome, FaShieldAlt, FaReceipt } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VnPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyVnPayPayment = async () => {
      try {
        const queryString = window.location.search.startsWith('?') 
          ? window.location.search.substring(1) 
          : window.location.search;

        const res = await paymentApi.processVnPayReturn(queryString);
        setResult(res.data);
      } catch (err) {
        console.error('VNPay return verification error:', err);
        setErrorMsg(err.response?.data?.message || 'Không thể xác thực giao dịch từ VNPay.');
      } finally {
        setLoading(false);
      }
    };

    if (window.location.search) {
      verifyVnPayPayment();
    } else {
      setLoading(false);
      setErrorMsg('Không tìm thấy thông tin phản hồi từ cổng thanh toán.');
    }
  }, [searchParams]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8fafc', minHeight: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 16px' }}>
        <LoadingSpinner />
        <h3 style={{ marginTop: '20px', color: '#0194f3', fontWeight: 700, fontSize: '1.25rem' }}>Đang xác thực giao dịch VNPay...</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Vui lòng giữ nguyên màn hình và không tắt trình duyệt.</p>
      </div>
    );
  }

  // Xác thực trạng thái thành công dựa trên response backend & mã vnp_ResponseCode
  const responseCode = searchParams.get('vnp_ResponseCode');
  const isSuccess = 
    result?.paymentStatus === 'PAID' || 
    result?.status === 'CONFIRMED' || 
    responseCode === '00' ||
    result?.success === true;

  const orderId = result?.id || searchParams.get('vnp_TxnRef');
  const orderCode = result?.orderCode || ('ORD-' + orderId);
  const transactionId = result?.paymentTransactionId || searchParams.get('vnp_TransactionNo') || 'VNP-' + Date.now();
  const totalAmount = result?.totalAmount || (searchParams.get('vnp_Amount') ? Number(searchParams.get('vnp_Amount')) / 100 : 0);

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '85vh', padding: '48px 16px 80px' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>
        <div style={{
          background: '#ffffff',
          border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '24px',
          padding: '44px 36px',
          textAlign: 'center',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          color: '#0f172a'
        }}>
          {isSuccess ? (
            <>
              <div style={{
                width: '84px', height: '84px', margin: '0 auto 20px',
                borderRadius: '50%', background: '#dcfce7',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 10px rgba(34, 197, 94, 0.1)'
              }}>
                <FaCheckCircle style={{ color: '#16a34a', fontSize: '2.8rem' }} />
              </div>
              
              <h2 style={{ color: '#0f172a', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                THANH TOÁN THÀNH CÔNG!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' }}>
                Giao dịch thanh toán trực tuyến qua cổng VNPay đã hoàn tất và được hệ thống ghi nhận.
              </p>

              {/* Biên lai điện tử (E-Receipt) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'left',
                marginBottom: '28px',
                fontSize: '0.92rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0194f3', fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>
                  <FaReceipt /> THÔNG TIN GIAO DỊCH
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>Mã đơn hàng:</span>
                  <strong style={{ color: '#0194f3', fontFamily: 'monospace', fontSize: '1rem' }}>{orderCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>Mã giao dịch VNPay:</span>
                  <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{transactionId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>Phương thức:</span>
                  <strong style={{ color: '#0f172a' }}>Cổng thanh toán điện tử VNPay</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#64748b' }}>Trạng thái vé:</span>
                  <span style={{ color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem' }}>
                    ĐÃ XÁC NHẬN (CONFIRMED)
                  </span>
                </div>
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>Số tiền đã thanh toán:</span>
                  <strong style={{ color: '#ff5e1f', fontSize: '1.4rem', fontWeight: 800 }}>{formatPrice(totalAmount)}</strong>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px', background: '#f0fdf4',
                border: '1px solid #bbf7d0', borderRadius: '12px',
                marginBottom: '32px', textAlign: 'left', fontSize: '0.88rem', color: '#166534'
              }}>
                <FaShieldAlt style={{ fontSize: '1.5rem', color: '#16a34a', flexShrink: 0 }} />
                <span>Vé điện tử và hóa đơn đã được kích hoạt. Quý khách có thể xem và tải vé trong mục <strong>Đơn Hàng Của Tôi</strong>.</span>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '84px', height: '84px', margin: '0 auto 20px',
                borderRadius: '50%', background: '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 10px rgba(239, 68, 68, 0.1)'
              }}>
                <FaTimesCircle style={{ color: '#dc2626', fontSize: '2.8rem' }} />
              </div>
              <h2 style={{ color: '#0f172a', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
                THANH TOÁN CHƯA THÀNH CÔNG
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '28px' }}>
                {errorMsg || result?.message || 'Giao dịch qua cổng VNPay bị hủy hoặc không hoàn tất.'}
              </p>
            </>
          )}

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/my-orders" 
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 28px', borderRadius: '12px',
                background: '#0194f3', color: '#ffffff',
                fontWeight: 700, fontSize: '0.95rem',
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(1, 148, 243, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <FaClipboardList /> Xem Đơn Hàng Của Tôi
            </Link>
            <Link 
              to="/" 
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 22px', borderRadius: '12px',
                background: '#ffffff', color: '#475569',
                border: '1px solid #cbd5e1',
                fontWeight: 600, fontSize: '0.95rem',
                textDecoration: 'none', transition: 'all 0.2s ease'
              }}
            >
              <FaHome /> Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnPayReturnPage;