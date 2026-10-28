import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaLock, 
  FaArrowLeft, 
  FaUserShield, 
  FaUserCheck, 
  FaEye, 
  FaEyeSlash, 
  FaBuilding, 
  FaUserTie,
  FaCheckCircle,
  FaBolt
} from 'react-icons/fa';
import './AuthPages.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Chuyển hướng an toàn sau khi đã đăng nhập (tránh navigate cứng '/' đè lên '/admin')
  useEffect(() => {
    if (user) {
      const redirectPath = location.state?.from?.pathname 
        || (user.role === 'ADMIN' ? '/admin' : '/');
      navigate(redirectPath, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Nạp nhanh tài khoản mẫu chuẩn theo Báo cáo Đồ án Đề tài 49
  const handleQuickLogin = (roleType) => {
    setSelectedRole(roleType);
    switch (roleType) {
      case 'admin':
        setCredentials({ username: 'admin', password: '123456' });
        toast.info('Đã chọn: Quản Trị Viên (admin / 123456)');
        break;
      case 'provider':
        setCredentials({ username: 'vietravel', password: '123456' });
        toast.info('Đã chọn: Nhà Cung Cấp Tour (vietravel / 123456)');
        break;
      case 'b2b':
        setCredentials({ username: 'fpt_corp', password: '123456' });
        toast.info('Đã chọn: Khách Đoàn B2B FPT (fpt_corp / 123456)');
        break;
      case 'customer':
      default:
        setCredentials({ username: 'customer', password: '123456' });
        toast.info('Đã chọn: Khách Hàng Cá Nhân (customer / 123456)');
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    
    setLoading(true);
    try {
      const result = await login({
        username: credentials.username.trim(),
        password: credentials.password,
        rememberMe,
      });
      if (result.success) {
        toast.success(`Chào mừng ${result.user.fullName || result.user.username} đã đăng nhập!`);
        
        // Chuyển hướng thông minh: ưu tiên trang trước đó người dùng đang xem (ví dụ: /checkout, /tours/1)
        const redirectPath = location.state?.from?.pathname 
          || (result.user.role === 'ADMIN' ? '/admin' : '/');
          
        navigate(redirectPath, { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Du Lịch Việt</h1>
        <p>Khám phá vẻ đẹp bất tận của Việt Nam và thế giới. Đăng nhập ngay để nhận những ưu đãi tour đặc biệt chỉ dành cho thành viên.</p>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaCheckCircle style={{ color: '#0194F3', fontSize: '0.9rem', flexShrink: 0 }} /> Hơn 100+ tour trọn gói chất lượng cao
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaCheckCircle style={{ color: '#0194F3', fontSize: '0.9rem', flexShrink: 0 }} /> Ưu đãi chiết khấu đoàn Doanh nghiệp B2B (5% - 10%)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaCheckCircle style={{ color: '#0194F3', fontSize: '0.9rem', flexShrink: 0 }} /> Đặt chỗ tức thì với khóa tranh chấp an toàn
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8' }}>
            <FaCheckCircle style={{ color: '#0194F3', fontSize: '0.9rem', flexShrink: 0 }} /> Chuyên viên tư vấn trực tuyến hỗ trợ 24/7
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng Nhập</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại với Du Lịch Việt!</p>

          {/* Quick Demo Fill Buttons - 4 Vai trò đầy đủ chuẩn Báo cáo */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '0.8rem', 
              color: '#475569', 
              marginBottom: '10px', 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span><FaBolt style={{ color: '#f59e0b', marginRight: '6px' }} />Đăng nhập nhanh tài khoản mẫu:</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>Pass: 123456</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* Quản trị viên */}
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin')}
                style={{
                  background: selectedRole === 'admin' ? '#fee2e2' : '#ffffff',
                  border: selectedRole === 'admin' ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                  color: '#dc2626',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                title="Quản trị viên: admin / 123456"
              >
                <FaUserShield /> Admin
              </button>

              {/* Nhà cung cấp Tour */}
              <button 
                type="button" 
                onClick={() => handleQuickLogin('provider')}
                style={{
                  background: selectedRole === 'provider' ? '#fef3c7' : '#ffffff',
                  border: selectedRole === 'provider' ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                  color: '#d97706',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                title="Nhà cung cấp tour: vietravel / 123456"
              >
                <FaBuilding /> Vietravel
              </button>

              {/* Khách đoàn Doanh nghiệp B2B */}
              <button 
                type="button" 
                onClick={() => handleQuickLogin('b2b')}
                style={{
                  background: selectedRole === 'b2b' ? '#f3e8ff' : '#ffffff',
                  border: selectedRole === 'b2b' ? '1.5px solid #a855f7' : '1px solid #e2e8f0',
                  color: '#9333ea',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                title="Khách đoàn B2B: fpt_corp / 123456"
              >
                <FaUserTie /> B2B (FPT)
              </button>

              {/* Khách hàng cá nhân */}
              <button 
                type="button" 
                onClick={() => handleQuickLogin('customer')}
                style={{
                  background: selectedRole === 'customer' ? '#e0f2fe' : '#ffffff',
                  border: selectedRole === 'customer' ? '1.5px solid #0ea5e9' : '1px solid #e2e8f0',
                  color: '#0284c7',
                  padding: '7px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.2s'
                }}
                title="Khách hàng cá nhân: customer / 123456"
              >
                <FaUserCheck /> Khách hàng
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tài khoản</label>
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Nhập tên đăng nhập (VD: customer hoặc admin)" 
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                <FaLock className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Nhập mật khẩu..." 
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingRight: '45px' }}
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
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help Link */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              fontSize: '0.85rem'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#475569',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#e8400c', cursor: 'pointer' }}
                />
                Ghi nhớ đăng nhập
              </label>

              <Link to="/help" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
                Cần trợ giúp?
              </Link>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Đang xác thực..." : "Đăng Nhập"}
            </button>
          </form>
          
          <div className="auth-footer" style={{ marginTop: '20px' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>
          <div className="auth-footer" style={{ marginTop: '12px' }}>
            <Link to="/" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FaArrowLeft /> Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
