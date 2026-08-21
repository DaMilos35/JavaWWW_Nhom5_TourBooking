import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error("Vui long nhap day du thong tin");
      return;
    }
    
    setLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
          toast.success('Đăng nhập thành công!');
          navigate('/');
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
        <p>Khám phá vẻ đẹp Việt Nam qua từng điểm đến. Đăng nhập ngay để nhận những ưu đãi tour đặc biệt chỉ dành cho thành viên.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Đăng Nhập</h2>
          <p className="auth-subtitle">Chào mừng bạn quay trở lại!</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tài khoản</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-user"></i>
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Nhập tên đăng nhập..." 
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-lock"></i>
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
              {loading ? <i className="fas fa-spinner fa-spin"></i> : "Đăng Nhập"}
            </button>
          </form>
          
          <div className="auth-footer">
            Chưa có tài khoản? 
            <Link to="/register" className="auth-link">Đăng ký ngay</Link>
          </div>
          <div className="auth-footer" style={{marginTop: '15px'}}>
            <Link to="/" className="auth-link"><i className="fas fa-arrow-left"></i> Quay lại trang chủ</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
