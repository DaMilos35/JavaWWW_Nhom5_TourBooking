import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { FaUsers, FaMapMarkedAlt, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalTours: 0, totalOrders: 0, totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call or real if implemented
    setLoading(false);
    setStats({ totalUsers: 15, totalTours: 24, totalOrders: 142, totalRevenue: 245000000 });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ color: '#343a40', marginBottom: '25px', fontWeight: '700' }}>TỔNG QUAN HỆ THỐNG</h2>
      
      <div className="stat-cards-grid">
        <div className="stat-card-admin">
          <div className="stat-icon-admin"><FaMapMarkedAlt /></div>
          <div className="stat-details">
            <p>Tổng số Tour</p>
            <h3>{stats.totalTours}</h3>
          </div>
        </div>
        
        <div className="stat-card-admin" style={{borderLeftColor: '#10b981'}}>
          <div className="stat-icon-admin" style={{color: '#10b981'}}><FaUsers /></div>
          <div className="stat-details">
            <p>Khách hàng</p>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="stat-card-admin" style={{borderLeftColor: '#f59e0b'}}>
          <div className="stat-icon-admin" style={{color: '#f59e0b'}}><FaClipboardList /></div>
          <div className="stat-details">
            <p>Đơn đặt Tour</p>
            <h3>{stats.totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card-admin" style={{borderLeftColor: '#3b82f6'}}>
          <div className="stat-icon-admin" style={{color: '#3b82f6'}}><FaMoneyBillWave /></div>
          <div className="stat-details">
            <p>Doanh thu (VND)</p>
            <h3>{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}</h3>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginBottom: '20px', color: '#1e3a8a' }}>Hoạt động gần đây</h3>
        <p style={{ color: '#6c757d' }}>Chưa có hoạt động nào nổi bật trong 24h qua.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
