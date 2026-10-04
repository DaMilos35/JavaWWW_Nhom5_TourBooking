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
  FaChevronDown
} from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items, getTotalItems } = useCart();
  const { savedTours } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [openPanel, setOpenPanel] = useState(null);
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

  // Đăng xuất và điều hướng về trang chủ
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
          <li>
            <Link to="/wishlist" className={location.pathname === '/wishlist' ? 'active' : ''}>
              Tour đã lưu
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

          <div className="nav-popover-container">
            <button
              type="button"
              className="nav-icon-btn"
              aria-label="Chọn ngôn ngữ"
              aria-expanded={openPanel === 'language'}
              onClick={() => togglePanel('language')}
            >
              <FaGlobe /><span>VI</span><FaChevronDown className="nav-chevron" />
            </button>
            {openPanel === 'language' && (
              <div className="nav-popover language-popover">
                <h3>Ngôn ngữ</h3>
                <button
                  type="button"
                  className="language-choice is-current"
                  aria-current="true"
                  onClick={() => setOpenPanel(null)}
                >
                  <span>Tiếng Việt</span><span>Đang sử dụng</span>
                </button>
                <div className="language-choice is-unavailable" aria-disabled="true">
                  <span>English</span><span>Chưa hỗ trợ</span>
                </div>
              </div>
            )}
          </div>

          <div className="nav-popover-container">
            <button
              type="button"
              className="nav-icon-btn notification-trigger"
              aria-label="Trạng thái đơn hàng"
              aria-expanded={openPanel === 'notifications'}
              onClick={() => togglePanel('notifications')}
            >
              <FaBell />
              {pendingNotifications > 0 && <span className="notification-badge">{pendingNotifications}</span>}
            </button>
            {openPanel === 'notifications' && (
              <section className="nav-popover notification-popover" aria-label="Trạng thái đơn gần đây">
                <div className="popover-heading">
                  <h3>Trạng thái đơn gần đây</h3>
                  {user && <button type="button" onClick={loadNotifications}>Làm mới</button>}
                </div>
                {!user ? (
                  <p className="popover-empty">Đăng nhập để xem các đơn đặt tour của bạn.</p>
                ) : loadingNotifications ? (
                  <p className="popover-empty">Đang tải đơn đặt…</p>
                ) : notificationError ? (
                  <div className="popover-empty">
                    <p>Không thể tải trạng thái đơn.</p>
                    <button type="button" onClick={loadNotifications}>Thử lại</button>
                  </div>
                ) : recentOrders.length ? (
                  <ul className="notification-list">
                    {recentOrders.map((order) => (
                      <li key={order.id}>
                        <Link to="/my-orders" onClick={() => setOpenPanel(null)}>
                          <span className={`notification-status status-${String(order.status).toLowerCase()}`} />
                          <span>
                            <strong>Đơn #{order.id}</strong>
                            <small>
                              {order.status === 'PENDING' ? 'Đang chờ xác nhận'
                                : order.status === 'CONFIRMED' ? 'Đã xác nhận'
                                  : order.status === 'CANCELLED' ? 'Đã hủy'
                                    : order.status === 'COMPLETED' ? 'Đã hoàn thành' : order.status}
                            </small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="popover-empty">Bạn chưa có đơn đặt tour nào.</p>
                )}
                {user && <Link className="popover-footer-link" to="/my-orders" onClick={() => setOpenPanel(null)}>Mở lịch sử đơn hàng</Link>}
              </section>
            )}
          </div>

          {/* Menu người dùng khi đã đăng nhập */}
          {user ? (
            <div className="user-menu-container">
              <button
                type="button"
                className="user-btn"
                onClick={() => togglePanel('account')}
                aria-expanded={openPanel === 'account'}
                aria-haspopup="true"
              >
                <div className="user-avatar">{getInitial(user.fullName || user.username)}</div>
                <span className="user-name">{user.fullName || user.username}</span>
                <FaChevronDown className="nav-chevron" />
              </button>
              
              {openPanel === 'account' && (
                <div className="dropdown-menu" role="menu">
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                      <FaCog /> <span>Trang Quản Trị Hệ Thống</span>
                    </Link>
                  )}
                  <Link to="/my-orders" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaClipboardList /> <span>Lịch Sử Đặt Tour</span>
                  </Link>
                  <Link to="/wishlist" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaHeart /> <span>Tour đã lưu ({savedTours.length})</span>
                  </Link>
                  <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => setOpenPanel(null)}>
                    <FaUserCircle /> <span>Cài đặt tài khoản</span>
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item"
                    role="menuitem"
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
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Menu dạng trượt (Drawer) trên điện thoại */}
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
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>Tour đã lưu ({savedTours.length})</Link>
            </li>
            <li>
              <Link to="/help" onClick={() => setMobileMenuOpen(false)}>Trung tâm trợ giúp</Link>
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
                  <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>Cài đặt tài khoản</Link>
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
