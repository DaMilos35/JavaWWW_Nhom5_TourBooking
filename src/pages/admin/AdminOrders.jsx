import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch, FaFilter, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách tất cả các đơn hàng trong hệ thống
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      const list = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      // Sắp xếp đơn mới đặt lên trên cùng
      const sorted = list.sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());
      setOrders(sorted);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng (Chờ xử lý, Đã xác nhận, Hoàn thành, Đã hủy)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  // Đếm số lượng theo trạng thái để hiển thị trên các thẻ tab
  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length;
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length;
  const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;

  // Lọc dữ liệu theo từ khóa tìm kiếm và trạng thái
  const filteredOrders = orders.filter(o => {
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchSearch = !searchTerm.trim() || 
      (o.fullName && o.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.phone && o.phone.includes(searchTerm)) ||
      (String(o.id).includes(searchTerm));
    return matchStatus && matchSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      {/* Tiêu đề trang */}
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Quản Lý Đơn Hàng</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Theo dõi, xử lý và cập nhật tiến độ đặt tour của khách hàng</p>
        </div>

        {/* Thanh tìm kiếm */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', width: '100%', maxWidth: '320px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, SĐT, mã ĐH..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1e293b', width: '100%' }}
          />
        </div>
      </div>

      {/* Bộ lọc tab trạng thái tiện lợi */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { key: 'ALL', label: 'Tất cả', count: orders.length, color: '#475569' },
          { key: 'PENDING', label: 'Chờ xử lý', count: pendingCount, color: '#b45309', bg: '#fef3c7' },
          { key: 'CONFIRMED', label: 'Đã xác nhận', count: confirmedCount, color: '#15803d', bg: '#dcfce7' },
          { key: 'COMPLETED', label: 'Hoàn thành', count: completedCount, color: '#0369a1', bg: '#e0f2fe' },
          { key: 'CANCELLED', label: 'Đã hủy', count: cancelledCount, color: '#b91c1c', bg: '#fee2e2' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: filterStatus === tab.key ? '2px solid #0284c7' : '1px solid #e2e8f0',
              background: filterStatus === tab.key ? '#f0f9ff' : '#fff',
              color: filterStatus === tab.key ? '#0284c7' : '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: tab.bg || '#f1f5f9',
              color: tab.color,
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Mã ĐH</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Khách hàng</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Ngày đặt</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Tổng tiền</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Cập nhật</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7' }}>#{order.id}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{order.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.9rem' }}>
                      {new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#e8400c' }}>
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 
                            order.status === 'CONFIRMED' ? '#dcfce7' :
                            order.status === 'COMPLETED' ? '#e0f2fe' :
                            order.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          color: 
                            order.status === 'CONFIRMED' ? '#15803d' :
                            order.status === 'COMPLETED' ? '#0369a1' :
                            order.status === 'PENDING' ? '#b45309' : '#b91c1c'
                        }}>
                          {order.status === 'CONFIRMED' ? 'Đã xác nhận' :
                           order.status === 'COMPLETED' ? 'Hoàn thành' :
                           order.status === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
                        </span>
                      </div>
                      <div>
                        {order.paymentStatus === 'PAID' ? (
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● Đã thanh toán</span>
                        ) : order.paymentStatus === 'REFUND_PENDING' ? (
                          <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, background: '#ffedd5', padding: '2px 6px', borderRadius: '4px' }}>⚠️ Cần hoàn tiền (${100 - (order.cancellationFeePercent ?? 0)}%)</span>
                        ) : order.paymentStatus === 'REFUNDED' ? (
                          <span style={{ fontSize: '0.75rem', color: '#9333ea', fontWeight: 600 }}>● Đã hoàn tiền</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 600 }}>● Chờ thanh toán</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.82rem',
                            background: '#fff',
                            color: '#334155'
                          }}
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="CONFIRMED">Đã xác nhận (PAID)</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="CANCELLED">Đã hủy</option>
                        </select>

                        {/* Nút Admin xác nhận thanh toán nhanh */}
                        {order.status === 'PENDING' && order.paymentStatus !== 'PAID' && (
                          <button
                            onClick={async () => {
                              try {
                                await adminApi.confirmPayment(order.id);
                                toast.success(`Đã xác nhận thanh toán đơn #${order.id}!`);
                                fetchOrders();
                              } catch (err) {
                                toast.error('Lỗi khi xác nhận thanh toán');
                              }
                            }}
                            style={{
                              background: '#16a34a', color: '#fff', border: 'none',
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                              fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
                              alignItems: 'center', gap: '4px'
                            }}
                            title="Xác nhận khách đã chuyển khoản thành công"
                          >
                            <FaCheck /> Xác nhận tiền về
                          </button>
                        )}

                        {/* Nút Admin xác nhận đã hoàn tiền nhanh */}
                        {order.paymentStatus === 'REFUND_PENDING' && (
                          <button
                            onClick={async () => {
                              try {
                                await adminApi.confirmRefund(order.id);
                                toast.success(`Đã cập nhật trạng thái đã hoàn tiền đơn #${order.id}!`);
                                fetchOrders();
                              } catch (err) {
                                toast.error('Lỗi khi cập nhật hoàn tiền');
                              }
                            }}
                            style={{
                              background: '#9333ea', color: '#fff', border: 'none',
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem',
                              fontWeight: 700, cursor: 'pointer'
                            }}
                            title="Xác nhận đã chuyển khoản hoàn tiền cho khách"
                          >
                            ✓ Đã chuyển hoàn
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <Link 
                        to={`/admin/orders/${order.id}`} 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          color: '#0284c7',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <FaEye /> Xem
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
