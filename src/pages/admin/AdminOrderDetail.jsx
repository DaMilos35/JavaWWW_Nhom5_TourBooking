import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaCheck, FaTimes, FaSave } from 'react-icons/fa';
import { adminApi, orderApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FallbackImage from '../../components/common/FallbackImage';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Tải thông tin chi tiết đơn hàng
  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getOrderById(id);
      setOrder(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Điều chỉnh số lượng vé/người tham gia của một mục tour
  const handleUpdateQuantity = async (detailId, newQuantity) => {
    if (newQuantity < 1) {
      toast.warning('Số lượng người tham gia phải từ 1 trở lên');
      return;
    }
    try {
      await adminApi.updateOrderDetail(id, detailId, newQuantity);
      toast.success('Đã cập nhật số lượng và tính lại tổng tiền');
      fetchOrder();
    } catch (error) {
      toast.error('Lỗi khi cập nhật số lượng');
    }
  };

  // Thay đổi trạng thái đơn (Chờ xử lý, Đã xác nhận, Hoàn thành, Đã hủy)
  const handleStatusChange = async (newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast.success(`Đã cập nhật trạng thái đơn: ${
        newStatus === 'CONFIRMED' ? 'Đã xác nhận' :
        newStatus === 'COMPLETED' ? 'Hoàn thành' :
        newStatus === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'
      }`);
      fetchOrder();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy đơn hàng</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="admin-page">
      {/* Header điều hướng */}
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link 
            to="/admin/orders" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#e2e8f0',
              color: '#334155',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            <FaArrowLeft /> Quay lại danh sách đơn hàng
          </Link>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
            Chi tiết Đơn hàng #{order.id}
          </h2>
        </div>

        {/* Nút in hóa đơn / phiếu thu */}
        <button 
          onClick={() => setShowInvoiceModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FaPrint /> In Phiếu Xác Nhận
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Thẻ Thông tin khách hàng */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Thông Tin Khách Hàng
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#334155' }}>
            <div><strong style={{ color: '#64748b' }}>Họ và tên:</strong> <span style={{ fontWeight: 600 }}>{order.fullName || order.contactName}</span></div>
            <div><strong style={{ color: '#64748b' }}>Số điện thoại:</strong> <span>{order.phone || order.contactPhone}</span></div>
            <div><strong style={{ color: '#64748b' }}>Email:</strong> <span>{order.email || order.contactEmail}</span></div>
            <div><strong style={{ color: '#64748b' }}>Ngày đặt:</strong> <span>{new Date(order.createdAt || order.orderDate).toLocaleString('vi-VN')}</span></div>
            <div><strong style={{ color: '#64748b' }}>Ghi chú:</strong> <span style={{ fontStyle: 'italic' }}>{order.notes || 'Không có ghi chú'}</span></div>
          </div>
          
          {/* Cập nhật nhanh trạng thái đơn */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#1e293b', marginBottom: '8px', fontSize: '0.9rem' }}>
              Trạng thái đơn hàng:
            </label>
            <select 
              value={order.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                background: '#fff',
                color: '#1e293b',
                fontWeight: 600
              }}
            >
              <option value="PENDING">Chờ xử lý (Chưa xác nhận)</option>
              <option value="CONFIRMED">Đã xác nhận (Khách đã thanh toán)</option>
              <option value="COMPLETED">Hoàn thành (Đã đi tour xong)</option>
              <option value="CANCELLED">Đã hủy (Hoàn trả chỗ ngồi)</option>
            </select>
          </div>
        </div>

        {/* Thẻ Danh sách các tour được đặt */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            Danh Sách Tour Đã Đặt
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#475569' }}>Ảnh</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#475569' }}>Tên Tour</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.85rem', color: '#475569' }}>Đơn giá</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '0.85rem', color: '#475569' }}>Số lượng</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '0.85rem', color: '#475569' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.orderDetails?.map(detail => (
                  <tr key={detail.id || detail.orderDetailId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <FallbackImage
                        src={detail.tour?.imageUrl}
                        alt={detail.tour?.name || 'Tour'}
                        style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{detail.tour?.name || detail.tour?.tourName || 'Tour'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Khởi hành: {detail.tour?.departureLocation || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '12px', color: '#475569', fontSize: '0.9rem' }}>
                      {formatPrice(detail.price || detail.unitPrice)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        style={{ width: '64px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        defaultValue={detail.quantity}
                        min="1"
                        onBlur={(e) => handleUpdateQuantity(detail.id || detail.orderDetailId, parseInt(e.target.value) || 1)}
                        title="Thay đổi số khách và nhấn ra ngoài để lưu"
                      />
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#e8400c' }}>
                      {formatPrice((detail.price || detail.unitPrice) * detail.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>Tổng cộng thanh toán:</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Modal In Phiếu Xác Nhận / Hóa Đơn */}
      {showInvoiceModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
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
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Mã đơn: #{order.id} · Ngày: {new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <div><strong>Khách hàng:</strong> {order.fullName || order.contactName}</div>
              <div><strong>Số điện thoại:</strong> {order.phone || order.contactPhone}</div>
              <div><strong>Email:</strong> {order.email || order.contactEmail}</div>
              <div><strong>Trạng thái:</strong> {order.status === 'CONFIRMED' ? 'Đã xác nhận' : order.status === 'COMPLETED' ? 'Hoàn thành' : 'Chờ xử lý'}</div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', marginBottom: '20px' }}>
              {order.orderDetails?.map(d => (
                <div key={d.id || d.orderDetailId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '6px' }}>
                  <span>{d.tour?.name || d.tour?.tourName} (x{d.quantity})</span>
                  <span style={{ fontWeight: 700 }}>{formatPrice((d.price || d.unitPrice) * d.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <strong style={{ fontSize: '1.1rem' }}>TỔNG THANH TOÁN:</strong>
              <strong style={{ fontSize: '1.3rem', color: '#e8400c' }}>{formatPrice(order.totalAmount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowInvoiceModal(false)}
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

export default AdminOrderDetail;
