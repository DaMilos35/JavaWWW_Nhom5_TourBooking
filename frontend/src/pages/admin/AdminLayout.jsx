import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaMapMarkedAlt, FaTags, FaClipboardList, FaUsers, FaBars, FaSignOutAlt, FaPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', name: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/tours', name: 'Quáº£n lÃ½ Tour', icon: <FaMapMarkedAlt /> },
    { path: '/admin/categories', name: 'Quáº£n lÃ½ Danh má»¥c', icon: <FaTags /> },
    { path: '/admin/orders', name: 'Quáº£n lÃ½ ÄÆ¡n hÃ ng', icon: <FaClipboardList /> },
    { path: '/admin/users', name: 'Quáº£n lÃ½ NgÆ°á»i dÃ¹ng', icon: <FaUsers /> },
  ];

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <Link to="/">
            <FaPlane className="mr-2" />
            {sidebarOpen && <span>VietTour Admin</span>}
          </Link>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          {sidebarOpen && <div className="user-info"><span>{user?.username}</span></div>}
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map(item => (
              <li key={item.path} className={location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)) ? 'active' : ''}>
                <Link to={item.path}>
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-text">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-header">
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="header-right">
            <Link to="/" className="btn btn-outline btn-sm mr-3">Xem trang chá»§</Link>
            <button onClick={handleLogout} className="btn-logout-icon">
              <FaSignOutAlt /> ÄÄƒng xuáº¥t
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

