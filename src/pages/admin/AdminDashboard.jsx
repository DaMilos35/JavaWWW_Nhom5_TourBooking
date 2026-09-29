import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, 
  FaMapMarkedAlt, 
  FaUsers, 
  FaClipboardList, 
  FaArrowUp, 
  FaEye, 
  FaPlus, 
  FaTags,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/axiosConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Trạng thái lưu trữ số liệu tổng quan hệ thống
  const [stats, setStats] = useState({
    totalTours: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu báo cáo từ backend khi mở trang
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboard();
        setStats(res.data);
      } catch (error) {
        console.error('Lỗi khi tải thống kê dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  // Định dạng số tiền VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="dashboard-container">
      {/* Tiêu đề & Lời chào */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title">Tổng quan hệ thống</h1>
          <p className="dashboard-subtitle">Theo dõi các chỉ số kinh doanh, lượng khách và tiến độ vận hành tour du lịch.</p>
        </div>
        
        {/* Phím tắt thao tác nhanh */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link 
            to="/admin/tours/new" 
            className="btn btn-primary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            <FaPlus /> Thêm Tour Mới
          </Link>
          <Link 
            to="/admin/categories" 
            className="btn btn-outline" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            <FaTags /> Danh Mục
          </Link>
        </div>
      </div>

      {/* 4 Thẻ thống kê cốt lõi */}
      <div className="stats-grid">
        {/* Thẻ doanh thu */}
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-primary">
            <FaChartLine className="text-primary" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">{formatPrice(stats.totalRevenue || 0)}</h3>
            <span className="stat-label">Doanh thu xác nhận</span>
            <div className="stat-trend positive">
              <FaArrowUp /> Doanh số thực tế
            </div>
          </div>
        </div>

        {/* Thẻ tổng số đơn */}
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-success">
            <FaClipboardList className="text-success" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">{stats.totalOrders}</h3>
            <span className="stat-label">Tổng đơn đặt tour</span>
            <div className="stat-trend positive">
              <FaArrowUp /> Toàn hệ thống
            </div>
          </div>
        </div>

        {/* Thẻ thành viên */}
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-info">
            <FaUsers className="text-info" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">{stats.totalUsers}</h3>
            <span className="stat-label">Khách hàng đăng ký</span>
            <div className="stat-trend positive">
              <FaCheckCircle /> Tài khoản hoạt động
            </div>
          </div>
        </div>

        {/* Thẻ tour đang mở bán */}
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-warning">
            <FaMapMarkedAlt className="text-warning" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">{stats.totalTours}</h3>
            <span className="stat-label">Tour đang mở bán</span>
            <div className="stat-trend positive">
              <FaArrowUp /> Tuyến tour đa dạng
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 2: Bảng đơn hàng gần đây & Danh sách tuyến tour thịnh hành */}
      <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Cột trái: Đơn hàng mới nhất */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Đơn hàng gần đây</h3>
            <Link to="/admin/orders" style={{ fontSize: '0.85rem', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
              Xem tất cả đơn →
            </Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Mã đơn</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Khách hàng</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Ngày đặt</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>Trạng thái</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>Tổng tiền</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#0284c7' }}>#{order.id}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{order.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.phone}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 
                            order.status === 'CONFIRMED' ? '#dcfce7' : 
                            order.status === 'COMPLETED' ? '#e0f2fe' : 
                            order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                          color: 
                            order.status === 'CONFIRMED' ? '#15803d' : 
                            order.status === 'COMPLETED' ? '#0369a1' : 
                            order.status === 'CANCELLED' ? '#b91c1c' : '#b45309'
                        }}>
                          {order.status === 'CONFIRMED' ? 'Đã xác nhận' : 
                           order.status === 'COMPLETED' ? 'Hoàn thành' : 
                           order.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#e8400c', fontSize: '0.9rem' }}>
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          style={{
                            padding: '4px 8px',
                            background: '#f1f5f9',
                            color: '#0284c7',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaEye /> Xem
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Chưa có đơn hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột phải: Tuyến Tour Nổi Bật & Tỷ Lệ Đặt */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Tuyến Tour Nổi Bật</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Hạ Long - Vịnh Lan Hạ 3N2Đ</span>
                <span style={{ color: '#0ea5e9', fontWeight: 600, fontSize: '0.85rem' }}>148 lượt đặt</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: '#0ea5e9', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Đà Nẵng - Hội An - Bà Nà 4N3Đ</span>
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>122 lượt đặt</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Phú Quốc Resort 5 Sao 4N3Đ</span>
                <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>96 lượt đặt</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: '#f59e0b', borderRadius: '3px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Nhật Bản Cung Đường Vàng 6N5Đ</span>
                <span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}>64 lượt đặt</span>
              </div>
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '45%', height: '100%', background: '#8b5cf6', borderRadius: '3px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
