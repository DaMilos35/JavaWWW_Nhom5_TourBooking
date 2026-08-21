import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { adminApi, orderApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getOrderById(id);
      setOrder(res.data);
    } catch (error) {
      toast.error('Lá»—i khi táº£i chi tiáº¿t Ä‘Æ¡n hÃ ng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (detailId, newQuantity) => {
    try {
      await adminApi.updateOrderDetail(id, detailId, newQuantity);
      toast.success('Cáº­p nháº­t sá»‘ lÆ°á»£ng thÃ nh cÃ´ng');
      fetchOrder(); // Reload to get new total
    } catch (error) {
      toast.error('Lá»—i khi cáº­p nháº­t sá»‘ lÆ°á»£ng');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast.success('Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng');
      fetchOrder();
    } catch (error) {
      toast.error('Lá»—i cáº­p nháº­t tráº¡ng thÃ¡i');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div>KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="admin-page">
      <div className="content-header mb-4">
        <Link to="/admin/orders" className="btn btn-outline-secondary btn-sm mb-3"><FaArrowLeft /> Quay láº¡i</Link>
        <h2>Chi tiáº¿t ÄÆ¡n hÃ ng #{order.id}</h2>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="admin-card">
            <div className="card-header"><h3 className="card-title">ThÃ´ng tin khÃ¡ch hÃ ng</h3></div>
            <div className="card-body">
              <p><strong>Há» tÃªn:</strong> {order.fullName}</p>
              <p><strong>SÄT:</strong> {order.phone}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>NgÃ y Ä‘áº·t:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              <p><strong>Ghi chÃº:</strong> {order.notes || 'KhÃ´ng cÃ³'}</p>
              <hr />
              <div className="form-group mt-3">
                <label>Tráº¡ng thÃ¡i Ä‘Æ¡n hÃ ng:</label>
                <select 
                  className="form-control" 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="PENDING">Chá» xá»­ lÃ½</option>
                  <option value="CONFIRMED">ÄÃ£ xÃ¡c nháº­n</option>
                  <option value="COMPLETED">HoÃ n thÃ nh</option>
                  <option value="CANCELLED">ÄÃ£ há»§y</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="admin-card">
            <div className="card-header"><h3 className="card-title">Danh sÃ¡ch Tour Ä‘Ã£ Ä‘áº·t</h3></div>
            <div className="card-body p-0">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>áº¢nh</th>
                    <th>TÃªn Tour</th>
                    <th>GiÃ¡</th>
                    <th>SL</th>
                    <th>ThÃ nh tiá»n</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderDetails?.map(detail => (
                    <tr key={detail.id}>
                      <td><img src={detail.tour?.imageUrl || 'https://via.placeholder.com/50'} alt="tour" style={{width:'50px', height:'50px', objectFit:'cover'}}/></td>
                      <td>{detail.tour?.name || 'Tour Ä‘Ã£ xÃ³a'}</td>
                      <td>{formatPrice(detail.price)}</td>
                      <td>
                        <input 
                          type="number" 
                          className="form-control form-control-sm" 
                          style={{width: '70px'}} 
                          defaultValue={detail.quantity}
                          onBlur={(e) => handleUpdateQuantity(detail.id, parseInt(e.target.value))}
                          min="1"
                        />
                      </td>
                      <td><strong>{formatPrice(detail.price * detail.quantity)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-right border-top bg-light">
                <h4>Tá»•ng thanh toÃ¡n: <span className="text-primary">{formatPrice(order.totalAmount)}</span></h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;

