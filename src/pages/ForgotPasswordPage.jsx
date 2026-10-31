import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaKey,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaClock,
  FaBolt,
  FaPaperPlane,
  FaExternalLinkAlt
} from 'react-icons/fa';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Các bước:
  // 1: Nhập Email hoặc SĐT
  // 'EMAIL_SENT': Đã gửi email, chờ người dùng mở email nhấp link
  // 2: Nhập OTP (khi chọn SMS)
  // 3: Đặt lại mật khẩu mới
  // 4: Hoàn tất thành công
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState('EMAIL'); // 'EMAIL' hoặc 'SMS'
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maskedTarget, setMaskedTarget] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Tự động nhận diện Token khi người dùng nhấn vào liên kết từ email:
  // Ví dụ: /reset-password?token=... hoặc /forgot-password?token=...
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setResetToken(urlToken);
      setStep(3);
      toast.info('Đã nhận diện liên kết đặt lại mật khẩu từ email!');
    }
  }, [searchParams]);

  // Bộ đếm ngược thời gian hiệu lực
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Nạp nhanh dữ liệu thử nghiệm
  const handleQuickFill = (type) => {
    if (type === 'real_email') {
      setChannel('EMAIL');
      setIdentifier('levietcaoson27@gmail.com');
      toast.info('Đã chọn email: levietcaoson27@gmail.com');
    } else if (type === 'email') {
      setChannel('EMAIL');
      setIdentifier('admin@dulichviet.vn');
      toast.info('Đã chọn email mẫu: admin@dulichviet.vn');
    } else {
      setChannel('SMS');
      setIdentifier('0901234567');
      toast.info('Đã chọn số điện thoại mẫu: 0901234567');
    }
  };

  // BƯỚC 1: Gửi yêu cầu nhận mã
  const handleSendResetCode = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Vui lòng nhập Email hoặc Số điện thoại!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/password/forgot', {
        channel,
        identifier: identifier.trim()
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Mã xác thực đã được gửi!');
        setMaskedTarget(res.data.target || identifier);
        setCountdown(res.data.expiresInSeconds || (channel === 'SMS' ? 300 : 900));

        if (channel === 'SMS') {
          // Kênh SMS -> chuyển sang Bước 2 xác thực OTP
          setStep(2);
          if (res.data.simulatedOtp) {
            setOtp(res.data.simulatedOtp);
            toast.info(`Mã OTP nhận được: ${res.data.simulatedOtp}`);
          }
        } else {
          // Kênh Email -> KHÔNG NHẢY BƯỚC 3!
          // Chuyển sang màn hình thông báo ĐÃ GỬI EMAIL, hướng dẫn người dùng kiểm tra hòm thư
          setStep('EMAIL_SENT');
          if (res.data.simulatedToken) {
            // Lưu ngầm token nếu người dùng muốn bấm "Nhập thủ công"
            setResetToken(res.data.simulatedToken);
          }
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi mã xác thực. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 2: Xác thực mã OTP (SMS)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Vui lòng nhập đúng mã OTP gồm 6 chữ số!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/password/verify-otp', {
        phone: identifier.trim(),
        otp: otp.trim()
      });

      if (res.data.success && res.data.resetToken) {
        toast.success('Xác thực OTP thành công!');
        setResetToken(res.data.resetToken);
        setCountdown(res.data.expiresInSeconds || 900);
        setStep(3); // Chuyển sang bước 3 đặt mật khẩu mới
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã xác thực OTP không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 3: Đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/password/reset', {
        resetToken,
        newPassword,
        confirmPassword
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Đặt lại mật khẩu thành công!');
        setStep(4); // Hoàn tất
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại. Token có thể đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Du Lịch Việt</h1>
        <p>Bảo vệ tài khoản an toàn tuyệt đối với chuẩn xác thực đa kênh (Email OTP / SMS Gateway).</p>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaShieldAlt style={{ color: '#0194F3', fontSize: '1rem', flexShrink: 0 }} /> Mã OTP băm SHA-256 an toàn trong cơ sở dữ liệu
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaShieldAlt style={{ color: '#0194F3', fontSize: '1rem', flexShrink: 0 }} /> Bảo vệ chống tấn công vét cạn (Brute-force) với Redis Rate Limiting
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaShieldAlt style={{ color: '#0194F3', fontSize: '1rem', flexShrink: 0 }} /> Tự động đăng xuất và hủy toàn bộ phiên làm việc cũ
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '14px',
              borderRadius: '50%',
              background: '#e0f2fe',
              color: '#0284c7',
              fontSize: '1.6rem',
              marginBottom: '12px'
            }}>
              <FaKey />
            </div>
            <h2>Quên Mật Khẩu</h2>
            <p className="auth-subtitle">
              {step === 1 && 'Chọn kênh nhận mã xác thực để khôi phục tài khoản của bạn'}
              {step === 'EMAIL_SENT' && 'Vui lòng kiểm tra hòm thư Email'}
              {step === 2 && `Nhập mã OTP 6 số đã gửi đến ${maskedTarget}`}
              {step === 3 && 'Tạo mật khẩu mới an toàn cho tài khoản'}
              {step === 4 && 'Đổi mật khẩu thành công!'}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px'
          }}>
            {[1, 2, 3, 4].map((s) => {
              const isActive = (step === 'EMAIL_SENT' && s <= 2) || (typeof step === 'number' && step >= s);
              return (
                <div
                  key={s}
                  style={{
                    width: ((step === 'EMAIL_SENT' && s === 2) || step === s) ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: isActive ? '#0284c7' : '#e2e8f0',
                    transition: 'all 0.3s'
                  }}
                />
              );
            })}
          </div>

          {/* Quick Demo Fill Buttons (Chỉ hiển thị ở Bước 1) */}
          {step === 1 && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaBolt style={{ color: '#f59e0b' }} /> Thử nghiệm nhanh tài khoản:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('real_email')}
                  style={{
                    gridColumn: '1 / -1',
                    background: identifier === 'levietcaoson27@gmail.com' ? '#dcfce7' : '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ✨ Chọn Email thật: levietcaoson27@gmail.com
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('email')}
                  style={{
                    background: channel === 'EMAIL' && identifier !== 'levietcaoson27@gmail.com' ? '#e0f2fe' : '#ffffff',
                    border: '1px solid #bae6fd',
                    color: '#0284c7',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ✉️ Email (admin)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sms')}
                  style={{
                    background: channel === 'SMS' ? '#e0f2fe' : '#ffffff',
                    border: '1px solid #bae6fd',
                    color: '#0284c7',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📱 SĐT (0901234567)
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: FORM GỬI YÊU CẦU */}
          {step === 1 && (
            <form onSubmit={handleSendResetCode}>
              {/* Channel Selector */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setChannel('EMAIL')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: channel === 'EMAIL' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: channel === 'EMAIL' ? '#f0f9ff' : '#ffffff',
                    color: channel === 'EMAIL' ? '#0284c7' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FaEnvelope /> Kênh Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: channel === 'SMS' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: channel === 'SMS' ? '#f0f9ff' : '#ffffff',
                    color: channel === 'SMS' ? '#0284c7' : '#64748b',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FaPhoneAlt /> Kênh SMS OTP
                </button>
              </div>

              <div className="form-group">
                <label>{channel === 'EMAIL' ? 'Địa chỉ Email tài khoản' : 'Số điện thoại'}</label>
                <div className="input-icon-wrapper">
                  {channel === 'EMAIL' ? <FaEnvelope className="input-icon" /> : <FaPhoneAlt className="input-icon" />}
                  <input
                    type={channel === 'EMAIL' ? 'email' : 'tel'}
                    placeholder={channel === 'EMAIL' ? 'Nhập email (VD: levietcaoson27@gmail.com)' : 'Nhập SĐT (VD: 0901234567)'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Đang gửi mã...' : 'Gửi liên kết đặt lại mật khẩu'}
              </button>
            </form>
          )}

          {/* STEP 'EMAIL_SENT': MÀN HÌNH CHỜ KIỂM TRA HÒM THƯ GMAIL (KHÔNG NHẢY BƯỚC 3) */}
          {step === 'EMAIL_SENT' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                background: '#f0fdf4',
                color: '#16a34a',
                fontSize: '2.4rem',
                marginBottom: '16px',
                border: '2px solid #bbf7d0'
              }}>
                <FaPaperPlane />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '8px', fontWeight: 700 }}>
                Đã gửi email khôi phục!
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Hệ thống đã gửi liên kết đặt lại mật khẩu đến: <br />
                <strong style={{ color: '#0284c7', fontSize: '1rem' }}>{maskedTarget}</strong>
              </p>

              <div style={{
                background: '#fffbeb',
                borderLeft: '4px solid #f59e0b',
                padding: '12px 16px',
                borderRadius: '6px',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: '#92400e',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}>
                <strong>Hướng dẫn tiếp theo:</strong>
                <ol style={{ paddingLeft: '18px', margin: '6px 0 0' }}>
                  <li>Mở hòm thư Gmail (kiểm tra cả mục Hộp thư đến và Spam).</li>
                  <li>Nhấn vào nút <strong>"Đặt Lại Mật Khẩu Ngay"</strong> trong email.</li>
                  <li>Trang web sẽ tự động mở màn hình nhập mật khẩu mới.</li>
                </ol>
              </div>

              {countdown > 0 && (
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#e8400c',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}>
                  <FaClock /> Liên kết có hiệu lực trong: {formatCountdown(countdown)}
                </div>
              )}

              {/* Nút mở nhanh hộp thư Gmail */}
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary btn-block"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  marginBottom: '14px'
                }}
              >
                Mở hòm thư Gmail <FaExternalLinkAlt style={{ fontSize: '0.85rem' }} />
              </a>

              {/* Hộp gợi ý khi chạy môi trường Demo */}
              {resetToken && (
                <div style={{
                  background: '#f0f9ff',
                  border: '1px dashed #0284c7',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: '4px' }}>
                    💡 Chưa cấu hình Gmail App Password trong .env?
                  </div>
                  <div style={{ color: '#475569', marginBottom: '8px' }}>
                    Hệ thống đang chạy chế độ mô phỏng an toàn. Bạn có thể nhấn vào liên kết bên dưới để vào thẳng màn hình đổi mật khẩu mà không cần đợi email:
                  </div>
                  <a
                    href={'/reset-password?token=' + resetToken}
                    style={{
                      color: '#0284c7',
                      fontWeight: 700,
                      wordBreak: 'break-all',
                      textDecoration: 'underline'
                    }}
                  >
                    Bấm vào đây để mở liên kết đặt lại mật khẩu &rarr;
                  </a>
                </div>
              )}

              {/* Tùy chọn nhập token thủ công */}
              <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FaKey /> Đã có mã token? Nhập mật khẩu mới ngay
                </button>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Đổi địa chỉ email khác hoặc gửi lại
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: FORM XÁC THỰC OTP (SMS) */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{
                textAlign: 'center',
                background: '#f0f9ff',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '0.85rem',
                color: '#0369a1'
              }}>
                Mã xác thực OTP đã được gửi đến: <strong>{maskedTarget}</strong>
                {countdown > 0 && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: '#e8400c', fontWeight: 600 }}>
                    <FaClock /> Hiệu lực còn: {formatCountdown(countdown)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Mã xác thực OTP (6 chữ số)</label>
                <div className="input-icon-wrapper">
                  <FaKey className="input-icon" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Nhập 6 chữ số OTP..."
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ letterSpacing: '6px', fontSize: '1.2rem', textAlign: 'center' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Xác thực OTP & Tiếp tục'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Gửi lại mã hoặc đổi số điện thoại
              </button>
            </form>
          )}

          {/* STEP 3: FORM NHẬP MẬT KHẨU MỚI (Chỉ khi có token từ email link hoặc OTP) */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                color: '#475569'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600 }}>
                  <FaCheckCircle /> Đã nhận diện Token xác thực
                </div>
                {countdown > 0 && (
                  <div style={{ marginTop: '4px', color: '#64748b' }}>
                    Thời hạn đổi mật khẩu còn: <strong>{formatCountdown(countdown)}</strong>
                  </div>
                )}
              </div>

              {/* Nếu chưa có token thì cho người dùng nhập token */}
              {!resetToken && (
                <div className="form-group">
                  <label>Mã Reset Token</label>
                  <div className="input-icon-wrapper">
                    <FaKey className="input-icon" />
                    <input
                      type="text"
                      placeholder="Dán mã Reset Token nhận từ email..."
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Mật khẩu mới</label>
                <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu & Thu hồi phiên cũ'}
              </button>
            </form>
          )}

          {/* STEP 4: HOÀN TẤT */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                display: 'inline-flex',
                padding: '16px',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#16a34a',
                fontSize: '2.5rem',
                marginBottom: '16px'
              }}>
                <FaCheckCircle />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: '8px' }}>Mật khẩu đã được thay đổi!</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.6 }}>
                Mật khẩu mới của bạn đã có hiệu lực. Toàn bộ các phiên đăng nhập cũ trên các thiết bị khác đã được đăng xuất an toàn.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate('/login')}
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FaArrowLeft /> Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
