import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { paymentApi } from '../api/axiosConfig';
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaHome, FaShieldAlt } from 'react-icons/fa';
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
      <div className="container py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
        <h3 style={{ marginTop: '20px', color: '#0ea5e9' }}>Đang xác thực kết quả thanh toán VNPay...</h3>
        <p style={{ color: '#94a3b8' }}>Vui lòng không tắt hoặc tải lại trình duyệt.</p>
      </div>
    );
  }

  const isSuccess = result?.success || result?.responseCode === '00';

  return (
    <div className="vnpay-return-page py-5">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{
          background: '#1e293b',
          border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          borderRadius: '20px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 30px rgba(0,0,0,0.3)',
          color: '#f8fafc'
        }}>
          {isSuccess ? (
            <>
              <div style={{
                width: '80px', height: '80px', margin: '0 auto 20px',
                borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaCheckCircle style={{ color: '#22c55e', fontSize: '3rem' }} />
              </div>
              <h2 style={{ color: '#22c55e', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem' }}>
                THANH TOÁN THÀNH CÔNG!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px' }}>
                Giao dịch thanh toán trực tuyến qua cổng VNPay đã hoàn tất và được hệ thống ghi nhận.
              </p>

              <div style={{
                background: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'left',
                marginBottom: '28px',
                fontSize: '0.95rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Mã đơn hàng:</span>
                  <strong style={{ color: '#38bdf8' }}>#{result?.orderId} ({result?.orderCode})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Mã giao dịch VNPay:</span>
                  <strong style={{ color: '#f8fafc' }}>{result?.transactionNo || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#94a3b8' }}>Phương thức:</span>
                  <strong style={{ color: '#f8fafc' }}>Cổng thanh toán điện tử VNPay</strong>
                </div>
                <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.15)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Số tiền thanh toán:</span>
                  <strong style={{ color: '#e8400c', fontSize: '1.25rem' }}>{formatPrice(result?.amount || 0)}</strong>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: 'rgba(14, 165, 233, 0.1)',
                border: '1px solid rgba(14, 165, 233, 0.25)', borderRadius: '10px',
                marginBottom: '28px', textAlign: 'left', fontSize: '0.88rem', color: '#bae6fd'
              }}>
                <FaShieldAlt style={{ fontSize: '1.4rem', color: '#38bdf8', flexShrink: 0 }} />
                <span>Vé của bạn đã được chuyển sang trạng thái <strong>ĐÃ XÁC NHẬN (CONFIRMED)</strong>. Email hoá đơn đã được gửi tự động.</span>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '80px', height: '80px', margin: '0 auto 20px',
                borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaTimesCircle style={{ color: '#ef4444', fontSize: '3rem' }} />
              </div>
              <h2 style={{ color: '#ef4444', fontWeight: 800, margin: '0 0 8px', fontSize: '1.75rem' }}>
                THANH TOÁN CHƯA THÀNH CÔNG
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '24px' }}>
                {errorMsg || result?.message || 'Giao dịch qua cổng VNPay bị hủy hoặc không thành công.'}
              </p>
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/my-orders" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '10px' }}>
              <FaClipboardList /> Xem Đơn Hàng Của Tôi
            </Link>
            <Link to="/" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px' }}>
              <FaHome /> Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnPayReturnPage;
