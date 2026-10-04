import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaArrowLeft, FaUserShield, FaUserCheck } from 'react-icons/fa';
import './AuthPages.css';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
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
    if (!credentials.username || !credentials.password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }
    
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        toast.success(`Chào mừng ${result.user.username} đã đăng nhập!`);
        if (result.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
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
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
            <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>✓</span> Hơn 100+ tour trọn gói chất lượng cao
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
            <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>✓</span> Đặt phòng & tour nhanh chóng chỉ trong 1 phút
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
            <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>✓</span> Hỗ trợ tư vấn và bảo lưu tour 24/7
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng Nhập</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại với Du Lịch Việt!</p>

          {/* Quick Demo Fill Buttons */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
              ⚡ Tài khoản mẫu có sẵn (Mật khẩu: 123456):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('customer')}
                style={{
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  color: '#38bdf8',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FaUserCheck /> Khách: customer1
              </button>
              <button 
                type="button" 
                onClick={() => handleQuickLogin('admin')}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FaUserShield /> Quản trị: admin
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
                  placeholder="Nhập tên đăng nhập (VD: customer1 hoặc admin)" 
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Nhập mật khẩu..." 
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng Nhập"}
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
