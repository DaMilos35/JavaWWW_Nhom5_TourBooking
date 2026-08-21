import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaIdCard, FaPhone, FaEnvelope, FaUser, FaLock, FaEye, FaEyeSlash, FaPlane } from 'react-icons/fa';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '', email: '', fullName: '', phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      await authApi.register(submitData);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#e0e0e0';
      case 1: return '#ff4d4d'; // Yeu
      case 2: return '#ffa64d'; // Trung bình
      case 3: return '#99cc00'; // Kha
      case 4: return '#33cc33'; // Manh
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
          <h1>VietTour</h1>
        </div>
        <h2>Bắt đầu hành trình của bạn</h2>
        <p>Đăng ký tài khoản để quản lý tour, nhận ưu đãi riêng và tích điểm đổi quà hấp dẫn từ hệ thống của chúng tôi.</p>
        <div className="auth-features">
          <div className="feature-item">✓ Hỗ trợ khách hàng 24/7</div>
          <div className="feature-item">✓ Thanh toán an toàn 100%</div>
          <div className="feature-item">✓ Hủy tour linh hoạt</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card register-card">
          <h2>Tạo Tài Khoản Mới</h2>
          <p className="auth-subtitle">Điền thông tin để tham gia cộng đồng VietTour</p>
          
          <form onSubmit={handleSubmit} className="register-form">
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
              <label>Email <span className="text-danger">*</span></label>
              <div className="input-icon-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
              </div>
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
                  <small className="text-danger" style={{fontSize: '11px'}}>Mật khẩu kh'ong kh'op</small>
                )}
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={loading || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword)}>
              {loading ? "Đang xử lý..." : "Tạo Tài Khoản Ngay"}
            </button>
          </form>
          
          <div className="auth-footer mt-4 text-center">
            <span style={{color: '#666'}}>Đã có tài khoản?</span> 
            <Link to="/login" className="auth-link ml-2" style={{fontWeight: 'bold', color: '#ff6b6b'}}>Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
