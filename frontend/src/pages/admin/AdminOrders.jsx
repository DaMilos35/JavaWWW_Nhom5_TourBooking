import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';
import { adminApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders();
      // Sort by newest first
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (error) {
      toast.error('Lá»—i khi táº£i Ä‘Æ¡n hÃ ng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateOrderStatus(id, newStatus);
      toast.success('Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng');
      fetchOrders();
    } catch (error) {
      toast.error('Lá»—i cáº­p nháº­t tráº¡ng thÃ¡i');
    }
  };

  const filteredOrders = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4">
        <h2>Quáº£n lÃ½ ÄÆ¡n hÃ ng</h2>
      </div>

      <div className="admin-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="filter-box">
            <select className="form-control form-control-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
              <option value="PENDING">Chá» xá»­ lÃ½</option>
              <option value="CONFIRMED">ÄÃ£ xÃ¡c nháº­n</option>
              <option value="COMPLETED">HoÃ n thÃ nh</option>
              <option value="CANCELLED">ÄÃ£ há»§y</option>
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>MÃ£ ÄH</th>
                  <th>KhÃ¡ch hÃ ng</th>
                  <th>NgÃ y Ä‘áº·t</th>
                  <th>Tá»•ng tiá»n</th>
                  <th>Tráº¡ng thÃ¡i</th>
                  <th>Cáº­p nháº­t</th>
                  <th>Chi tiáº¿t</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div><strong>{order.fullName}</strong></div>
                      <div className="text-muted" style={{fontSize: '0.85em'}}>{order.phone}</div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td><strong>{formatPrice(order.totalAmount)}</strong></td>
                    <td>
                      <span className={`badge ${order.status === 'PENDING' ? 'badge-warning' : 
                                               order.status === 'CONFIRMED' ? 'badge-success' : 
                                               order.status === 'COMPLETED' ? 'badge-primary' : 'badge-danger'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-control form-control-sm" 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{width: '120px'}}
                      >
                        <option value="PENDING">Chá» xá»­ lÃ½</option>
                        <option value="CONFIRMED">ÄÃ£ xÃ¡c nháº­n</option>
                        <option value="COMPLETED">HoÃ n thÃ nh</option>
                        <option value="CANCELLED">ÄÃ£ há»§y</option>
                      </select>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.id}`} className="btn btn-sm btn-info"><FaEye /> Xem</Link>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="text-center py-4">KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng nÃ o</td></tr>
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

