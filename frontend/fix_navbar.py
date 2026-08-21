import os

navbar_jsx = '''
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaPlane, FaUsers, FaGlobeAsia, FaTags, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          <FaPlane className="logo-icon" /> VietTour
        </Link>
        
        <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        
        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Trang Chủ</Link>
          </li>
          <li className="nav-item">
            <Link to="/tours" className="nav-link" onClick={() => setIsOpen(false)}>
              Khám Phá
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tours" className="nav-link" onClick={() => setIsOpen(false)}>
              Khuyến Mãi
            </Link>
          </li>
          
          {isAdmin() && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link admin-nav-link" onClick={() => setIsOpen(false)}>
                <FaUsers className="mr-1" /> TRANG QUẢN TRỊ
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-right">
          <Link to="/cart" className="cart-icon" title="Giỏ hàng">
            <FaShoppingCart />
            {getTotalItems() > 0 && <span className="cart-badge">{getTotalItems()}</span>}
          </Link>
          
          {user ? (
            <div className="user-dropdown-container">
              <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              
              {dropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">Xin chào, <strong>{user.username}</strong></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Hồ sơ của tôi</Link>
                  <Link to="/my-orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Đơn hàng của tôi</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item text-danger w-100 text-left border-0 bg-transparent">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-nav btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-nav btn-register">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
'''

with open('src/components/layout/Navbar.jsx', 'w', encoding='utf-8') as f:
    f.write(navbar_jsx)

print("Created Navbar.jsx")
