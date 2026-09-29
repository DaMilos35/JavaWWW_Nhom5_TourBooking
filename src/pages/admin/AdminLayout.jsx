import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaMapMarkedAlt, 
  FaTags, 
  FaClipboardList, 
  FaUsers, 
  FaBars, 
  FaSignOutAlt, 
  FaCompass, 
  FaBell, 
  FaExchangeAlt,
  FaUserShield,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import './AdminLayout.css';

const AdminLayout = () => {
  // Mặc định mở trên desktop, thu gọn trên mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, switchDemoAccount } = useAuth();

  // Tải số lượng đơn hàng đang chờ xử lý để hiển thị thông báo
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await adminApi.getOrders();
        const orders = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        const pending = orders.filter(o => o.status === 'PENDING').length;
        setPendingOrdersCount(pending);
      } catch (err) {
        // Im lặng nếu không tải được thông báo
      }
    };
    fetchPendingOrders();
  }, [location.pathname]);

  // Đóng sidebar khi đổi trang trên màn hình di động
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Chuyển sang tài khoản khách hàng để kiểm thử trải nghiệm mua tour
  const handleQuickSwitchToCustomer = async () => {
    try {
      await switchDemoAccount('CUSTOMER');
      toast.info('Đã chuyển sang tài khoản khách hàng (customer1)');
      navigate('/');
    } catch (e) {
      toast.error('Không thể chuyển tài khoản');
    }
  };

  const navItems = [
    { path: '/admin', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/tours', name: 'Quản Lý Tour', icon: <FaMapMarkedAlt /> },
    { path: '/admin/categories', name: 'Danh Mục', icon: <FaTags /> },
    { 
      path: '/admin/orders', 
      name: 'Đơn Hàng', 
      icon: <FaClipboardList />, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null 
    },
    { path: '/admin/users', name: 'Khách Hàng', icon: <FaUsers /> },
  ];

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="admin-wrapper">
      {/* Lớp nền mờ khi mở sidebar trên điện thoại */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Thanh điều hướng bên trái (Sidebar) */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <Link to="/admin">
            <div className="brand-icon"><FaCompass /></div>
            {sidebarOpen && <span className="brand-text">Admin Panel</span>}
          </Link>
        </div>
        
        <div className="sidebar-menu-label">
          {sidebarOpen ? 'QUẢN TRỊ HỆ THỐNG' : '---'}
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => {
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path} className={isActive ? 'active' : ''}>
                  <Link to={item.path}>
                    <span className="nav-icon">{item.icon}</span>
                    {sidebarOpen && (
                      <div className="nav-text-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span className="nav-text">{item.name}</span>
                        {item.badge && (
                          <span style={{
                            background: '#ef4444',
                            color: '#fff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tiện ích chuyển đổi nhanh tài khoản dưới chân sidebar */}
        {sidebarOpen && (
          <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button 
              onClick={handleQuickSwitchToCustomer}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#cbd5e1',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Đổi vai trò sang khách hàng để thử nghiệm đặt tour"
            >
              <FaExchangeAlt /> Thử nghiệm: Sang Khách
            </button>
          </div>
        )}
      </aside>

      {/* Khu vực nội dung chính */}
      <div className="admin-main">
        {/* Thanh Header trên cùng */}
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="toggle-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Đóng / mở menu bên trái"
              aria-label="Toggle Sidebar"
            >
              <FaBars />
            </button>
            <div className="header-page-title" style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
              Du Lịch Việt • Bảng Điều Hành
            </div>
          </div>
          
          <div className="header-right">
            {/* Chuông thông báo đơn hàng chờ xử lý */}
            <Link 
              to="/admin/orders" 
              className="icon-btn" 
              title={pendingOrdersCount > 0 ? `${pendingOrdersCount} đơn hàng mới đang chờ xử lý` : 'Không có đơn chờ'}
            >
              <FaBell />
              {pendingOrdersCount > 0 && (
                <span className="badge">{pendingOrdersCount}</span>
              )}
            </Link>

            {/* Nút quay về trang bán tour */}
            <Link 
              to="/" 
              className="btn btn-outline admin-view-website-btn" 
              style={{ 
                margin: '0 12px', 
                borderRadius: '6px', 
                padding: '6px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <FaHome /> Về Website
            </Link>
            
            {/* Thông tin hồ sơ admin */}
            <div className="header-profile">
              <div className="profile-avatar">
                <FaUserShield />
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.fullName || user?.username || 'Admin'}</span>
                <span className="profile-role">Quản Trị Viên</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Đăng xuất khỏi hệ thống">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Vùng hiển thị các trang con của Admin */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
