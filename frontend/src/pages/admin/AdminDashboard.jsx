import React from 'react';
import { FaChartLine, FaMapMarkedAlt, FaUsers, FaClipboardList, FaArrowUp } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Tổng quan hệ thống</h1>
        <p className="dashboard-subtitle">Chào mừng trở lại, theo dõi các chỉ số quan trọng hôm nay.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-primary">
            <FaChartLine className="text-primary" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">124.5M ₫</h3>
            <span className="stat-label">Tổng doanh thu</span>
            <div className="stat-trend positive">
              <FaArrowUp /> 12% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-success">
            <FaClipboardList className="text-success" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">342</h3>
            <span className="stat-label">Đơn đặt tour</span>
            <div className="stat-trend positive">
              <FaArrowUp /> 5% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-info">
            <FaUsers className="text-info" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">1,250</h3>
            <span className="stat-label">Khách hàng</span>
            <div className="stat-trend positive">
              <FaArrowUp /> 18% so với tháng trước
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-light-warning">
            <FaMapMarkedAlt className="text-warning" />
          </div>
          <div className="stat-details">
            <h3 className="stat-value">48</h3>
            <span className="stat-label">Tour đang hoạt động</span>
            <div className="stat-trend positive">
              <FaArrowUp /> 2 tour mới
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="dashboard-col-8">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Đơn hàng gần đây</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tour</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#ORD-001</td>
                      <td>Nguyễn Văn A</td>
                      <td>Tour Đà Nẵng 3N2Đ</td>
                      <td>17/09/2026</td>
                      <td><span className="badge badge-success">Hoàn thành</span></td>
                      <td>5,500,000 ₫</td>
                    </tr>
                    <tr>
                      <td>#ORD-002</td>
                      <td>Trần Thị B</td>
                      <td>Tour Phú Quốc 4N3Đ</td>
                      <td>16/09/2026</td>
                      <td><span className="badge badge-warning">Chờ xử lý</span></td>
                      <td>12,000,000 ₫</td>
                    </tr>
                    <tr>
                      <td>#ORD-003</td>
                      <td>Lê Hoàng C</td>
                      <td>Tour Sapa 2N1Đ</td>
                      <td>15/09/2026</td>
                      <td><span className="badge badge-primary">Đã xác nhận</span></td>
                      <td>3,200,000 ₫</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-col-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">Tour bán chạy</h3>
            </div>
            <div className="card-body">
              <div className="top-tour-item">
                <div className="tour-info">
                  <div className="tour-name">Đà Nẵng - Hội An</div>
                  <div className="tour-sales">145 lượt đặt</div>
                </div>
                <div className="tour-progress">
                  <div className="progress-bar bg-primary" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="top-tour-item">
                <div className="tour-info">
                  <div className="tour-name">Phú Quốc Xanh</div>
                  <div className="tour-sales">98 lượt đặt</div>
                </div>
                <div className="tour-progress">
                  <div className="progress-bar bg-success" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="top-tour-item">
                <div className="tour-info">
                  <div className="tour-name">Sapa Mù Sương</div>
                  <div className="tour-sales">76 lượt đặt</div>
                </div>
                <div className="tour-progress">
                  <div className="progress-bar bg-warning" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
