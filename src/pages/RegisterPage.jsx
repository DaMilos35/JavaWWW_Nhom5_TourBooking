import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaPlane, 
  FaCheckCircle,
  FaKey,
  FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '', email: '', fullName: '', phone: ''
  });
  const [step, setStep] = useState(1); // 1: Thông tin đăng ký, 2: Xác thực OTP qua Gmail
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer = null;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length > 5) strength += 1;
    if (pass.length > 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    setPasswordStrength(Math.min(4, strength));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Bước 1: Yêu cầu mã OTP qua Gmail
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await authApi.sendOtp(formData.email.trim());
      toast.success(res.data?.message || 'Mã OTP đã được gửi về Gmail của bạn!');
      if (res.data?.simulatedOtp) {
        setSimulatedOtp(res.data.simulatedOtp);
      }
      setStep(2);
      setCountdown(60);
    } catch (error) {
      const msg = error.response?.data?.message 
        || (typeof error.response?.data === 'string' && error.response.data.length < 150 ? error.response.data : null)
        || (error.code === 'ERR_NETWORK' || !error.response || error.response?.status >= 500 ? 'Không thể kết nối đến máy chủ Backend (Port 8080).' : 'Có lỗi xảy ra khi gửi mã OTP.');
      toast.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || sendingOtp) return;
    setSendingOtp(true);
    try {
      const res = await authApi.sendOtp(formData.email.trim());
      toast.success('Đã gửi lại mã xác thực OTP mới!');
      if (res.data?.simulatedOtp) {
        setSimulatedOtp(res.data.simulatedOtp);
      }
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi gửi lại mã OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Bước 2: Xác nhận OTP & Hoàn tất tạo tài khoản
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số mã xác thực OTP!');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData, otp: otp.trim() };
      delete submitData.confirmPassword;
      await authApi.register(submitData);
      toast.success('Đăng ký tài khoản thành công! Email chào mừng đã được gửi tới Gmail của bạn.');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message 
        || (typeof error.response?.data === 'string' && error.response.data.length < 150 ? error.response.data : null)
        || (error.code === 'ERR_NETWORK' || !error.response || error.response?.status >= 500 ? 'Không thể kết nối đến máy chủ Backend (Port 8080).' : 'Có lỗi xảy ra khi xác thực OTP.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#e0e0e0';
      case 1: return '#ff4d4d';
      case 2: return '#ffa64d';
      case 3: return '#99cc00';
      case 4: return '#33cc33';
      default: return '#e0e0e0';
    }
  };

  const getStrengthText = () => {
    switch(passwordStrength) {
      case 0: return '';
      case 1: return 'Yếu';
      case 2: return 'Trung bình';
      case 3: return 'Khá';
      case 4: return 'Mạnh';
      default: return '';
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <FaPlane size={40} />
          <h1>Du Lịch Việt</h1>
        </div>
        <h2>Bắt đầu hành trình của bạn</h2>
        <p>Đăng ký tài khoản bảo mật bằng mã OTP gửi về Gmail để quản lý tour, nhận ưu đãi hội viên và tích điểm thưởng.</p>
        <div className="auth-features">
          <div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Xác thực Gmail qua OTP 6 số bảo mật</div>
          <div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Đặt cọc trước 30% giữ chỗ tức thì</div>
          <div className="feature-item"><FaCheckCircle style={{ color: "#0194F3", marginRight: "8px" }} /> Nhận vé điện tử E-Ticket qua Email</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card register-card">
          <h2>{step === 1 ? 'Tạo Tài Khoản Mới' : 'Xác Thực Gmail (OTP)'}</h2>
          <p className="auth-subtitle">
            {step === 1 
              ? 'Điền thông tin và xác thực tài khoản qua hòm thư Gmail' 
              : `Mã xác thực 6 số đã được gửi đến: ${formData.email}`}
          </p>

          {/* BƯỚC 1: NHẬP THÔNG TIN TÀI KHOẢN */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="register-form">
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Họ và Tên <span className="text-danger">*</span></label>
                  <div className="input-icon-wrapper">
                    <FaIdCard className="input-icon" />
                    <input type="text" name="fullName" placeholder="VD: Nguyễn Văn A" value={formData.fullName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group half-width">
                  <label>Số điện thoại <span className="text-danger">*</span></label>
                  <div className="input-icon-wrapper">
                    <FaPhone className="input-icon" />
                    <input type="tel" name="phone" placeholder="VD: 0987654321" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Email Gmail <span className="text-danger">*</span></label>
                <div className="input-icon-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input type="email" name="email" placeholder="VD: nguyenvan@gmail.com" value={formData.email} onChange={handleChange} required />
                </div>
                <small style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Hệ thống sẽ gửi mã OTP 6 số về Gmail này để xác thực quyền sở hữu.
                </small>
              </div>

              <div className="form-group">
                <label>Tên đăng nhập <span className="text-danger">*</span></label>
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <input type="text" name="username" placeholder="Nhập tên đăng nhập" value={formData.username} onChange={handleChange} required minLength="4" />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group half-width">
                  <label>Mật khẩu <span className="text-danger">*</span></label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Từ 6 ký tự trở lên" value={formData.password} onChange={handleChange} minLength="6" required />
                    <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                  {formData.password.length > 0 && (
                    <div className="password-strength-container mt-1">
                      <div className="strength-bar-bg" style={{height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden', marginTop: '5px'}}>
                        <div className="strength-bar" style={{height: '100%', width: `${(passwordStrength/4)*100}%`, backgroundColor: getStrengthColor(), transition: 'all 0.3s'}}></div>
                      </div>
                      <small style={{color: getStrengthColor(), fontWeight: 'bold', fontSize: '11px'}}>{getStrengthText()}</small>
                    </div>
                  )}
                </div>
                <div className="form-group half-width">
                  <label>Xác nhận mật khẩu <span className="text-danger">*</span></label>
                  <div className="input-icon-wrapper">
                    <FaLock className="input-icon" />
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} minLength="6" required />
                  </div>
                  {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                    <small className="text-danger" style={{fontSize: '11px'}}>Mật khẩu xác nhận không khớp</small>
                  )}
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block mt-3" 
                disabled={sendingOtp || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword)}
              >
                {sendingOtp ? "Đang gửi mã OTP..." : "Nhận Mã OTP Qua Gmail →"}
              </button>
            </form>
          )}

          {/* BƯỚC 2: NHẬP MÃ XÁC THỰC OTP GỬI VỀ GMAIL */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="otp-verification-form">
              <div className="otp-verification-box">
                <FaShieldAlt style={{ fontSize: '2rem', color: '#0284c7', marginBottom: '10px' }} />
                <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0 }}>
                  Vui lòng kiểm tra hộp thư đến (hoặc thư mục Quảng cáo/Spam) của Gmail:
                </p>
                <div className="otp-target-email">{formData.email}</div>

                <input
                  type="text"
                  maxLength="6"
                  className="otp-input-field"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />

                <div className="otp-countdown-wrap">
                  {countdown > 0 ? (
                    <span>Gửi lại mã sau <strong>{countdown}s</strong></span>
                  ) : (
                    <span>
                      Chưa nhận được mã? 
                      <button 
                        type="button" 
                        className="btn-resend-otp" 
                        onClick={handleResendOtp}
                        disabled={sendingOtp}
                      >
                        {sendingOtp ? "Đang gửi..." : "Gửi lại mã ngay"}
                      </button>
                    </span>
                  )}
                </div>

                {simulatedOtp && (
                  <div className="otp-test-hint">
                    ⚡ <strong>Mã thử nghiệm cục bộ:</strong> <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '2px' }}>{simulatedOtp}</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Đang xác thực tài khoản..." : "Xác Nhận & Hoàn Tất Đăng Ký"}
              </button>

              <button 
                type="button" 
                className="btn btn-outline btn-block mt-2" 
                onClick={() => setStep(1)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <FaArrowLeft /> Quay lại sửa thông tin
              </button>
            </form>
          )}
          
          <div className="auth-footer mt-4 text-center">
            <span style={{color: '#666'}}>Đã có tài khoản?</span> 
            <Link to="/login" className="auth-link ml-2" style={{fontWeight: 'bold', color: '#0194F3'}}>Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
