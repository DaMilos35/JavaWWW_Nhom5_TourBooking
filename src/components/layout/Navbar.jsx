import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { orderApi } from '../../api/axiosConfig';
import { 
  FaCompass, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaCog, 
  FaShoppingBag, 
  FaBars, 
  FaTimes, 
  FaClipboardList,
  FaShieldAlt,
  FaHeart,
  FaGlobe,
  FaBell,
  FaChevronDown,
  FaCommentDots,
  FaQuestionCircle,
  FaCheckCircle
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items, getTotalItems } = useCart();
  const { savedTours } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [openPanel, setOpenPanel] = useState(null);
  const [selectedLang, setSelectedLang] = useState('VI');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenPanel(null);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpenPanel(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setOpenPanel(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    setNotificationError(false);
    try {
      const response = await orderApi.getMyOrders();
      setRecentOrders((response.data || []).slice(0, 4));
    } catch {
      setNotificationError(true);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const togglePanel = (panel) => {
    const nextPanel = openPanel === panel ? null : panel;
    setOpenPanel(nextPanel);
    if (panel === 'notifications' && nextPanel) loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpenPanel(null);
    setMobileMenuOpen(false);
    setRecentOrders([]);
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const totalCartCount = getTotalItems ? getTotalItems() : (items?.length || 0);
  const pendingNotifications = user
    ? recentOrders.filter((order) => order.status === 'PENDING').length
    : 0;

  return (
    <nav className="navbar" ref={navRef}>
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <FaCompass className="logo-icon text-accent" />
          <span className="logo-text">Du Lịch <span className="text-accent">Việt</span></span>
        </Link>
        
        {/* Desktop Nav Links */}
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
          <li>
            <Link to="/wishlist" className={location.pathname === '/wishlist' ? 'active' : ''}>
              Tour đã lưu
              {user && savedTours.length > 0 && <span className="nav-pill-count">{savedTours.length}</span>}
            </Link>
          </li>
          <li>
            <Link to="/help" className={location.pathname === '/help' ? 'active' : ''}>
              Hỗ trợ
            </Link>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="nav-right">
          {/* Admin shortcut button if role is ADMIN */}
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className="admin-badge-btn"
              title="Vào trang quản trị hệ thống"
            >
              <FaShieldAlt /> Quản Trị
            </Link>
          )}

          {/* Cart Icon Button */}
          <Link to="/cart" className="nav-action-btn btn-cart-nav" aria-label="Giỏ hàng">
            <FaShoppingBag />
            {totalCartCount > 0 && (
              <span className="cart-badge">{totalCartCount}</span>
            )}
          </Link>

          {/* Language Dropdown */}
          <div className="nav-popover-container">
            <button
              type="button"
              className={`nav-action-btn lang-btn ${openPanel === 'language' ? 'active' : ''}`}
              aria-label="Chọn ngôn ngữ"
              aria-expanded={openPanel === 'language'}
              onClick={() => togglePanel('language')}
            >
              <FaGlobe />
              <span>{selectedLang}</span>
              <FaChevronDown className="nav-chevron" />
            </button>
            {openPanel === 'language' && (
              <div className="nav-popover language-popover">
                <div className="popover-title">Chọn ngôn ngữ</div>
                <button
                  type="button"
                  className={`lang-option ${selectedLang === 'VI' ? 'is-selected' : ''}`}
                  onClick={() => { setSelectedLang('VI'); setOpenPanel(null); }}
                >
                  <span className="lang-flag">🇻🇳</span>
                  <div className="lang-text">
                    <strong>Tiếng Việt</strong>
                    <small>Việt Nam</small>
                  </div>
                  {selectedLang === 'VI' && <FaCheckCircle className="check-icon" />}
                </button>
                <button
                  type="button"
                  className={`lang-option ${selectedLang === 'EN' ? 'is-selected' : ''}`}
                  onClick={() => { setSelectedLang('EN'); setOpenPanel(null); }}
                >
                  <span className="lang-flag">🇺🇸</span>
                  <div className="lang-text">
                    <strong>English</strong>
                    <small>United States</small>
                  </div>
                  {selectedLang === 'EN' && <FaCheckCircle className="check-icon" />}
                </button>
                <button
                  type="button"
                  className={`lang-option ${selectedLang === 'FR' ? 'is-selected' : ''}`}
                  onClick={() => { setSelectedLang('FR'); setOpenPanel(null); }}
                >
                  <span className="lang-flag">🇫🇷</span>
                  <div className="lang-text">
                    <strong>Français</strong>
                    <small>Belgique / France</small>
                  </div>
                  {selectedLang === 'FR' && <FaCheckCircle className="check-icon" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="nav-popover-container">
            <button
              type="button"
              className={`nav-action-btn notification-trigger ${openPanel === 'notifications' ? 'active' : ''}`}
              aria-label="Thông báo"
              aria-expanded={openPanel === 'notifications'}
              onClick={() => togglePanel('notifications')}
            >
              <FaBell />
              {pendingNotifications > 0 ? (
                <span className="notification-badge">{pendingNotifications}</span>
              ) : (
                <span className="notification-dot" />
              )}
            </button>
            {openPanel === 'notifications' && (
              <div className="nav-popover notification-popover" aria-label="Thông báo">
                <div className="popover-heading">
                  <h3>Thông báo</h3>
                  {user && (
                    <button type="button" className="refresh-btn" onClick={loadNotifications}>
                      Làm mới
                    </button>
                  )}
                </div>
                {!user ? (
                  <div className="popover-empty">
                    <p>Đăng nhập để nhận thông báo đơn hàng và ưu đãi dành riêng cho bạn.</p>
                    <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setOpenPanel(null)}>
                      Đăng nhập
                    </Link>
                  </div>
                ) : loadingNotifications ? (
                  <div className="popover-empty"><p>Đang tải thông báo...</p></div>
                ) : notificationError ? (
                  <div className="popover-empty">
                    <p>Không thể tải thông báo.</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={loadNotifications}>Thử lại</button>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <ul className="notification-list">
                    {recentOrders.map((order) => (
                      <li key={order.id}>
                        <Link to="/my-orders" onClick={() => setOpenPanel(null)} className="notification-item">
                          <span className={`notification-status-icon status-${String(order.status).toLowerCase()}`} />
                          <div className="notif-content">
                            <strong>Đơn tour #{order.id}</strong>
                            <p>
                              {order.status === 'PENDING' && 'Đơn hàng đang chờ xác nhận từ ban tổ chức'}
                              {order.status === 'CONFIRMED' && 'Đơn hàng của bạn đã được xác nhận thành công!'}
                              {order.status === 'COMPLETED' && 'Chuyến đi đã hoàn thành. Cảm ơn bạn!'}
                              {order.status === 'CANCELLED' && 'Đơn hàng đã được hoàn hủy theo yêu cầu'}
                            </p>
                            <small className="notif-time">Gần đây</small>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="popover-empty">
                    <p>Chào mừng bạn đến với Du Lịch Việt! Bạn chưa có thông báo mới nào.</p>
                  </div>
                )}
                {user && (
                  <div className="popover-footer">
                    <Link to="/my-orders" onClick={() => setOpenPanel(null)}>
                      Xem tất cả lịch sử đặt chỗ →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account / Auth Buttons */}
          {user ? (
            <div className="user-menu-container">
              <button
                type="button"
                className={`user-btn ${openPanel === 'account' ? 'active' : ''}`}
                onClick={() => togglePanel('account')}
                aria-expanded={openPanel === 'account'}
                aria-haspopup="true"
              >
                <div className="user-avatar">{getInitial(user.fullName || user.username)}</div>
                <span className="user-name">{user.fullName || user.username}</span>
                <FaChevronDown className="nav-chevron" />
              </button>
              
              {openPanel === 'account' && (
                <div className="dropdown-menu account-dropdown" role="menu">
                  <div className="account-dropdown-header">
                    <div className="user-avatar-lg">{getInitial(user.fullName || user.username)}</div>
                    <div className="user-info-text">
                      <div className="user-full-name">{user.fullName || user.username}</div>
                      <div className="user-email-text">{user.email}</div>
                      <span className="user-verified-badge"><FaCheckCircle /> Đã xác thực danh tính</span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link to="/my-orders" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaClipboardList className="item-icon" />
                    <span>Đặt chỗ ({recentOrders.length})</span>
                  </Link>

                  <Link to="/wishlist" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaHeart className="item-icon" />
                    <span>Danh sách yêu thích ({savedTours.length})</span>
                  </Link>

                  <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaUserCircle className="item-icon" />
                    <span>Cài đặt tài khoản</span>
                  </Link>

                  <Link to="/help" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaQuestionCircle className="item-icon" />
                    <span>Trung tâm trợ giúp</span>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item admin-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                      <FaCog className="item-icon" />
                      <span>Quản trị hệ thống</span>
                    </Link>
                  )}
                  
                  <div className="dropdown-divider" />

                  <button 
                    className="dropdown-item logout-btn"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="item-icon text-danger" /> 
                    <span className="text-danger">Đăng Xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns-nav">
              <Link to="/login" className="btn btn-outline nav-auth-btn">Đăng Nhập</Link>
              <Link to="/register" className="btn btn-primary nav-auth-btn">Đăng Ký</Link>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" id="mobile-navigation">
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
            </li>
            <li>
              <Link to="/tours" onClick={() => setMobileMenuOpen(false)}>Khám Phá Tour</Link>
            </li>
            <li>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                Tour đã lưu ({savedTours.length})
              </Link>
            </li>
            <li>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)}>Trung tâm trợ giúp</Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>Lịch sử đặt chỗ</Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Cài đặt tài khoản</Link>
                </li>
                {user.role === 'ADMIN' && (
                  <li>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Trang quản trị</Link>
                  </li>
                )}
                <li>
                  <button className="mobile-logout-btn" onClick={handleLogout}>Đăng xuất ({user.username})</button>
                </li>
              </>
            ) : (
              <li className="mobile-auth-row">
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
