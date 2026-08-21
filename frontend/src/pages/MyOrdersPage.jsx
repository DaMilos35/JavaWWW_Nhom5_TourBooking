import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data);
    } catch (error) {
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xử lý', color: 'bg-warning' },
      'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-success' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-danger' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-primary' }
    };
    const s = statusMap[status] || { label: status, color: 'bg-secondary' };
    return <span className={`badge ${s.color}`}>{s.label}</span>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="my-orders-page bg-light py-4">
      <div className="container">
        <h2 className="mb-4">LỊCH SỬ ĐẶT TOUR</h2>
        
        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="card-box text-center py-5">
            <p>Bạn chưa có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card card-box mb-3">
                <div className="order-header" onClick={() => toggleExpand(order.id)}>
                  <div className="oh-info">
                    <strong>Mã ĐH: #{order.id}</strong>
                    <span className="text-muted ml-3">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="oh-status">
                    {getStatusBadge(order.status)}
                    <span className="order-total ml-3">{formatPrice(order.totalAmount)}</span>
                    <button className="btn btn-sm btn-outline ml-3">
                      {expandedOrder === order.id ? 'Thu gọn' : 'Chi tiết'}
                    </button>
                  </div>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="order-details mt-3 pt-3 border-top">
                    <h4>Chi tiết tour:</h4>
                    <ul className="order-items-list">
                      {order.orderDetails?.map(detail => (
                        <li key={detail.id} className="order-item-row">
                          <span className="oi-name">{detail.tour?.name || 'Tour đã bị xóa'}</span>
                          <span className="oi-qty">SL: {detail.quantity}</span>
                          <span className="oi-price">{formatPrice(detail.price)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-contact mt-3 bg-light p-3 rounded">
                      <p><strong>Người đặt:</strong> {order.fullName}</p>
                      <p><strong>SĐT:</strong> {order.phone}</p>
                      <p><strong>Email:</strong> {order.email}</p>
                      <p><strong>Ghi chú:</strong> {order.notes || 'Không có'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
