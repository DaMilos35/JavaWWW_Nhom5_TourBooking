import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaMapMarkedAlt, FaTags, FaClipboardList, FaUsers, FaBars, FaSignOutAlt, FaCompass, FaBell, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/tours', name: 'Quản Lý Tour', icon: <FaMapMarkedAlt /> },
    { path: '/admin/categories', name: 'Danh Mục', icon: <FaTags /> },
    { path: '/admin/orders', name: 'Đơn Hàng', icon: <FaClipboardList /> },
    { path: '/admin/users', name: 'Khách Hàng', icon: <FaUsers /> },
  ];

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
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
                    {sidebarOpen && <span className="nav-text">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
            <div className="header-search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="icon-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <Link to="/" className="btn btn-outline" style={{ margin: '0 16px', borderRadius: '4px', padding: '6px 12px' }}>
              Về Website
            </Link>
            
            <div className="header-profile">
              <div className="profile-avatar">{getInitial(user?.username)}</div>
              <div className="profile-info">
                <span className="profile-name">{user?.username || 'Admin'}</span>
                <span className="profile-role">Administrator</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Đăng xuất">
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
