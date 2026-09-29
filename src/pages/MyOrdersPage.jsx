import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/axiosConfig';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaShoppingBag, FaTimesCircle, FaPrint, FaCheckCircle } from 'react-icons/fa';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null); // Modal xem hóa đơn điện tử

  // Tải danh sách đơn hàng của người dùng hiện tại
  const fetchOrders = async () => {
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Xử lý khách hủy đơn khi còn ở trạng thái Chờ xử lý
  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Chỗ ngồi sẽ được hoàn trả lại cho hệ thống.')) {
      try {
        await orderApi.cancelOrder(orderId);
        toast.success('Đã hủy đơn đặt tour thành công');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng này');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xử lý', bg: '#fef3c7', color: '#b45309' },
      'CONFIRMED': { label: 'Đã xác nhận', bg: '#dcfce7', color: '#15803d' },
      'CANCELLED': { label: 'Đã hủy', bg: '#fee2e2', color: '#b91c1c' },
      'COMPLETED': { label: 'Hoàn thành', bg: '#e0f2fe', color: '#0369a1' }
    };
    const s = statusMap[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
    return (
      <span style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: s.bg,
        color: s.color
      }}>
        {s.label}
      </span>
    );
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
    <div className="my-orders-page">
      <div className="container">
        <h2 className="mb-4">LỊCH SỬ ĐẶT TOUR CỦA TÔI</h2>
        
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="card-surface text-center py-5" style={{ borderRadius: '16px', padding: '60px 20px' }}>
            <FaShoppingBag size={56} style={{ color: '#64748b', marginBottom: '16px' }} />
            <h3 style={{ color: '#fff', marginBottom: '8px' }}>Bạn chưa có đơn đặt tour nào</h3>
            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
              Hãy bắt đầu khám phá các chuyến hành trình hấp dẫn và đặt tour ngay hôm nay!
            </p>
            <Link to="/tours" className="btn btn-primary">
              Khám Phá Danh Sách Tour
            </Link>
          </div>
        ) : (
          <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const isExpanded = expandedOrder === order.id;
              const isPending = order.status === 'PENDING';
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header" onClick={() => toggleExpand(order.id)}>
                    <div className="oh-info">
                      <strong>Mã đơn hàng: #{order.id}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                        Ngày đặt: {formatDate(order.createdAt || order.orderDate)}
                      </span>
                    </div>
                    <div className="oh-status">
                      {getStatusBadge(order.status)}
                      <span className="order-total">{formatPrice(order.totalAmount)}</span>
                      <button 
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isExpanded ? <>Thu gọn <FaChevronUp /></> : <>Chi tiết <FaChevronDown /></>}
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="order-details">
                      <h4 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1rem' }}>Chi tiết các tour đã đặt:</h4>
                      <ul className="order-items-list">
                        {order.orderDetails?.map(detail => {
                          const tourName = detail.tour?.name || detail.tour?.tourName || 'Tour du lịch';
                          const unitPrice = detail.price || detail.unitPrice || 0;
                          return (
                            <li key={detail.id || detail.orderDetailId} className="order-item-row">
                              <span className="oi-name">{tourName}</span>
                              <span className="oi-qty">Số lượng: {detail.quantity} vé</span>
                              <span className="oi-price">{formatPrice(unitPrice * detail.quantity)}</span>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="order-contact-box" style={{ marginBottom: '16px' }}>
                        <p><strong>Người đại diện:</strong> {order.fullName || order.contactName}</p>
                        <p><strong>Số điện thoại:</strong> {order.phone || order.contactPhone}</p>
                        <p><strong>Địa chỉ email:</strong> {order.email || order.contactEmail}</p>
                        <p><strong>Ghi chú đơn hàng:</strong> {order.notes || 'Không có ghi chú'}</p>
                      </div>

                      {/* Action buttons inside order card */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => setInvoiceOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FaPrint /> Xem Phiếu Xác Nhận Tour
                        </button>
                        
                        {isPending && (
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              borderRadius: '6px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <FaTimesCircle /> Hủy Đơn Hàng Này
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Phiếu Xác Nhận Tour / Hóa đơn điện tử */}
      {invoiceOrder && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            color: '#1e293b',
            padding: '32px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#0284c7', fontSize: '1.4rem', fontWeight: 800 }}>DU LỊCH VIỆT</h3>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>PHIẾU XÁC NHẬN ĐẶT TOUR ĐIỆN TỬ</p>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Mã đơn: #{invoiceOrder.id} · Ngày lập: {formatDate(invoiceOrder.createdAt || invoiceOrder.orderDate)}</div>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div><strong>Họ tên khách hàng:</strong> {invoiceOrder.fullName || invoiceOrder.contactName}</div>
              <div><strong>Số điện thoại:</strong> {invoiceOrder.phone || invoiceOrder.contactPhone}</div>
              <div><strong>Email:</strong> {invoiceOrder.email || invoiceOrder.contactEmail}</div>
              <div><strong>Trạng thái:</strong> {invoiceOrder.status === 'CONFIRMED' ? 'Đã xác nhận thanh toán' : invoiceOrder.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang chờ xác nhận'}</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', marginBottom: '20px' }}>
              {invoiceOrder.orderDetails?.map(d => (
                <div key={d.id || d.orderDetailId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>{d.tour?.name || d.tour?.tourName} (x{d.quantity})</span>
                  <span style={{ fontWeight: 700 }}>{formatPrice((d.price || d.unitPrice) * d.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <strong style={{ fontSize: '1.1rem' }}>TỔNG THANH TOÁN:</strong>
              <strong style={{ fontSize: '1.3rem', color: '#e8400c' }}>{formatPrice(invoiceOrder.totalAmount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setInvoiceOrder(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Đóng
              </button>
              <button 
                onClick={() => window.print()}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaPrint /> In Phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
