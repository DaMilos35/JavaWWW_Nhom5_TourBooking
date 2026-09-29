import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  FaCompass, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCog, 
  FaShoppingBag, 
  FaBars, 
  FaTimes, 
  FaClipboardList,
  FaExchangeAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, switchDemoAccount } = useAuth();
  const { items, getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Đăng xuất và điều hướng về trang chủ
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  // Đổi nhanh tài khoản giữa Admin và Customer để tiện kiểm thử
  const handleQuickSwitch = async () => {
    setShowDropdown(false);
    setMobileMenuOpen(false);
    const targetRole = user?.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await switchDemoAccount(targetRole);
      toast.info(`Đã đổi sang: ${targetRole === 'ADMIN' ? 'Quản trị viên (admin)' : 'Khách hàng (customer1)'}`);
      if (targetRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error('Lỗi khi chuyển đổi vai trò');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const totalCartCount = getTotalItems ? getTotalItems() : (items?.length || 0);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Logo thương hiệu */}
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <FaCompass className="text-accent" />
          <span>Du Lịch Việt</span>
        </Link>
        
        {/* Liên kết điều hướng chính trên máy tính */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Trang Chủ
            </Link>
          </li>
          <li>
            <Link to="/tours" className={location.pathname.startsWith('/tours') ? 'active' : ''}>
              Khám Phá Tour
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/my-orders" className={location.pathname === '/my-orders' ? 'active' : ''}>
                Đơn Hàng Của Tôi
              </Link>
            </li>
          )}
        </ul>

        {/* Các nút chức năng bên phải */}
        <div className="nav-right">
          {/* Nút vào nhanh trang Quản Trị dành cho Admin */}
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className="btn btn-outline"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                borderColor: '#0284c7',
                color: '#0284c7',
                fontWeight: 600
              }}
            >
              <FaShieldAlt /> Quản Trị
            </Link>
          )}

          {/* Giỏ hàng */}
          <Link to="/cart" className="btn-cart-nav" aria-label="Giỏ hàng">
            <FaShoppingBag />
            {totalCartCount > 0 && (
              <span className="cart-badge">{totalCartCount}</span>
            )}
          </Link>

          {/* Menu người dùng khi đã đăng nhập */}
          {user ? (
            <div className="user-menu-container">
              <div className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">{getInitial(user.fullName || user.username)}</div>
                <span className="user-name">{user.fullName || user.username}</span>
              </div>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaCog /> <span>Trang Quản Trị Hệ Thống</span>
                    </Link>
                  )}
                  <Link to="/my-orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaClipboardList /> <span>Lịch Sử Đặt Tour</span>
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaUserCircle /> <span>Hồ Sơ Của Tôi</span>
                  </Link>
                  
                  {/* Phím đổi nhanh vai trò để test tính năng */}
                  <button 
                    className="dropdown-item" 
                    onClick={handleQuickSwitch} 
                    style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <FaExchangeAlt style={{ color: '#0284c7' }} /> 
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                      Đổi sang {user.role === 'ADMIN' ? 'Khách hàng' : 'Quản trị viên'}
                    </span>
                  </button>

                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item" 
                    onClick={handleLogout} 
                    style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <FaSignOutAlt style={{ color: '#ef4444' }} /> 
                    <span style={{ color: '#ef4444' }}>Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns-nav">
              <Link to="/login" className="btn btn-outline">Đăng Nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng Ký</Link>
            </div>
          )}

          {/* Nút Hamburger menu trên di động */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Menu dạng trượt (Drawer) trên điện thoại */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
            </li>
            <li>
              <Link to="/tours" onClick={() => setMobileMenuOpen(false)}>Khám Phá Tour</Link>
            </li>
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <li>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0284c7', fontWeight: 700 }}>
                      <FaCog /> Trang Quản Trị Hệ Thống
                    </Link>
                  </li>
                )}
                <li>
                  <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>Lịch Sử Đặt Tour</Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Hồ Sơ Của Tôi</Link>
                </li>
                <li>
                  <button onClick={handleQuickSwitch} className="mobile-logout-btn" style={{ color: '#0284c7', borderColor: '#0284c7' }}>
                    <FaExchangeAlt /> Chuyển sang {user.role === 'ADMIN' ? 'Khách hàng' : 'Quản trị viên'}
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <FaSignOutAlt /> Đăng Xuất ({user.username})
                  </button>
                </li>
              </>
            ) : (
              <li className="mobile-auth-actions">
                <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Đăng Nhập</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Đăng Ký</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
