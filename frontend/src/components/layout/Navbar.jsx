import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaCompass, FaUserCircle, FaSignOutAlt, FaCog, FaShoppingBag } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <FaCompass />
          <span>TourBooking</span>
        </Link>
        
        <ul className="nav-links">
          <li><Link to="/">Trang Chủ</Link></li>
          <li><Link to="/tours">Khám Phá</Link></li>
          <li><Link to="/about">Giới Thiệu</Link></li>
        </ul>

        <div className="nav-right">
          <Link to="/cart" className="btn btn-outline" style={{ position: 'relative' }}>
            <FaShoppingBag />
            {cart && cart.length > 0 && (
              <span className="cart-badge" style={{
                position: 'absolute', top: '-5px', right: '-5px', 
                background: 'var(--primary-color)', color: '#fff', 
                borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
              }}>
                {cart.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="user-menu-container">
              <div className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">{getInitial(user.username)}</div>
                <span className="user-name">{user.username}</span>
              </div>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaCog /> <span>Trang Quản Trị</span>
                    </Link>
                  )}
                  <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FaUserCircle /> <span>Hồ Sơ Của Tôi</span>
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    <FaSignOutAlt className="text-danger" /> <span className="text-danger">Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Đăng Nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
