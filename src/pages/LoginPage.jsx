import React, { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaLock, 
  FaArrowLeft, 
  FaUserShield, 
  FaUserCheck, 
  FaCompass, 
  FaCheck,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import './AuthPages.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleQuickLogin = (userType) => {
    if (userType === 'admin') {
      setCredentials({ username: 'admin', password: '123456' });
    } else {
      setCredentials({ username: 'customer1', password: '123456' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    
    setLoading(true);
    try {
      const result = await login({
        username: credentials.username.trim(),
        password: credentials.password
      });

      if (result.success) {
        toast.success(`Chào mừng ${result.user.fullName || result.user.username} đã đăng nhập!`);
        if (result.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from === '/login' ? '/' : from);
        }
      } else {
        const errorText = typeof result.error === 'string' ? result.error : 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        toast.error(errorText);
      }
    } catch {
      toast.error('Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <FaCompass className="brand-icon" />
          <h1>Du Lịch Việt</h1>
        </div>
        <h2>Khám phá thế giới theo cách của bạn</h2>
        <p>
          Đăng nhập ngay để quản lý đơn đặt tour, đồng bộ danh sách yêu thích và nhận những ưu đãi đặc biệt chỉ dành cho thành viên.
        </p>
        <div className="auth-features-list">
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Hơn 100+ tour trọn gói chất lượng cao</span>
          </div>
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Đặt phòng & tour nhanh chóng chỉ trong 1 phút</span>
          </div>
          <div className="auth-feature-item">
            <span className="check-bullet"><FaCheck /></span>
            <span>Hỗ trợ tư vấn và bảo lưu chuyến đi 24/7</span>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng Nhập</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại với Du Lịch Việt!</p>

          {/* Quick Demo Fill Buttons */}
          <div style={{
            background: '#f7f9fc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#6c757d', marginBottom: '8px', fontWeight: 700 }}>
              ⚡ Tài khoản mẫu trải nghiệm nhanh (Mật khẩu: 123456):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('customer')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#1f497d',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                <FaUserCheck style={{ color: '#10b981' }} /> Khách: customer1
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin')}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#1f497d',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}
              >
                <FaUserShield style={{ color: '#ff5722' }} /> Quản trị: admin
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Tài khoản</label>
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <input 
                  id="login-username"
                  type="text" 
                  name="username" 
                  placeholder="Nhập tên đăng nhập (VD: customer1 hoặc admin)" 
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <input 
                  id="login-password"
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  placeholder="Nhập mật khẩu..." 
                  value={credentials.password}
                  onChange={handleChange}
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
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
          
          <div className="auth-footer" style={{ marginTop: '20px' }}>
            <span>Chưa có tài khoản?</span>{' '}
            <Link to="/register" className="auth-link">Đăng ký ngay</Link>
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

export default LoginPage;
