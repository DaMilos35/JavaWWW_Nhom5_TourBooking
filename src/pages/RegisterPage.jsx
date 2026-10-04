import React, { useState } from 'react';
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
  FaCompass,
  FaArrowLeft,
  FaCheck
} from 'react-icons/fa';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    setPasswordStrength(Math.min(4, strength));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim() || formData.username.trim(),
        phone: formData.phone.trim()
      };

      await authApi.register(submitData);
      
      // Tự động đăng nhập ngay sau khi đăng ký thành công
      const loginRes = await login({ 
        username: submitData.username, 
        password: submitData.password 
      });

      if (loginRes.success) {
        toast.success(`Đăng ký thành công! Chào mừng ${submitData.fullName || submitData.username} đến với Du Lịch Việt!`);
        navigate('/');
      } else {
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        navigate('/login');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
        (typeof error.response?.data === 'string' ? error.response.data : 'Có lỗi xảy ra khi đăng ký');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#0284c7';
      case 4: return '#10b981';
      default: return '#e2e8f0';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 1: return 'Mật khẩu yếu';
      case 2: return 'Trung bình';
      case 3: return 'Khá mạnh';
      case 4: return 'Rất mạnh';
      default: return '';
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <FaCompass className="brand-icon" />
          <h1>Du Lịch Việt</h1>
        </div>
        <h2>Bắt đầu hành trình của bạn</h2>
        <p>
          Đăng ký tài khoản thành viên để lưu tour yêu thích, quản lý đơn đặt vé và nhận ưu đãi độc quyền dành riêng cho bạn.
        </p>
        <div className="auth-features-list">
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Hơn 100+ tour trọn gói chất lượng cao trên toàn quốc</span>
          </div>
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Đặt chỗ và nhận xác nhận nhanh chóng chỉ trong 1 phút</span>
          </div>
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Chăm sóc khách hàng và hỗ trợ tư vấn chuyến đi 24/7</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card register-card">
          <h2>Tạo Tài Khoản Mới</h2>
          <p className="auth-subtitle">Tham gia cộng đồng khám phá Du Lịch Việt</p>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-fullName">Họ và tên <span className="text-danger">*</span></label>
                <div className="input-icon-wrapper">
                  <FaIdCard className="input-icon" />
                  <input 
                    id="reg-fullName"
                    type="text" 
                    name="fullName" 
                    placeholder="Nguyễn Văn An" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-phone">Số điện thoại</label>
                <div className="input-icon-wrapper">
                  <FaPhone className="input-icon" />
                  <input 
                    id="reg-phone"
                    type="tel" 
                    name="phone" 
                    placeholder="0901234567" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email <span className="text-danger">*</span></label>
              <div className="input-icon-wrapper">
                <FaEnvelope className="input-icon" />
                <input 
                  id="reg-email"
                  type="email" 
                  name="email" 
                  placeholder="email@example.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-username">Tên đăng nhập <span className="text-danger">*</span></label>
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <input 
                  id="reg-username"
                  type="text" 
                  name="username" 
                  placeholder="Tên đăng nhập (tối thiểu 4 ký tự)" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  minLength={4} 
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-password">Mật khẩu <span className="text-danger">*</span></label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <input 
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    placeholder="Từ 6 ký tự trở lên" 
                    value={formData.password} 
                    onChange={handleChange} 
                    minLength={6} 
                    required 
                  />
                  <div 
                    className="password-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                    role="button"
                    tabIndex={0}
                    aria-label="Hiện/ẩn mật khẩu"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {formData.password.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(passwordStrength / 4) * 100}%`, backgroundColor: getStrengthColor(), transition: 'all 0.3s' }} />
                    </div>
                    <small style={{ color: getStrengthColor(), fontWeight: 700, fontSize: '0.72rem', display: 'block', marginTop: '2px' }}>
                      {getStrengthText()}
                    </small>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-confirmPassword">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <input 
                    id="reg-confirmPassword"
                    type={showPassword ? 'text' : 'password'} 
                    name="confirmPassword" 
                    placeholder="Nhập lại mật khẩu" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    minLength={6} 
                    required 
                  />
                </div>
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <small className="text-danger" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    Mật khẩu xác nhận không khớp
                  </small>
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword)}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Ngay'}
            </button>
          </form>
          
          <div className="auth-footer">
            <span>Đã có tài khoản?</span> 
            <Link to="/login" className="auth-link">Đăng nhập ngay</Link>
          </div>

          <div className="auth-footer" style={{ marginTop: '12px' }}>
            <Link to="/" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6c757d', fontWeight: 600 }}>
              <FaArrowLeft /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
