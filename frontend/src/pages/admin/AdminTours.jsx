import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/axiosConfig';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTours = async () => {
    try {
      const response = await adminApi.getTours();
      setTours(response.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
      try {
        await adminApi.deleteTour(id);
        toast.success('Xóa tour thành công');
        fetchTours();
      } catch (error) {
        toast.error('Không thể xóa tour đang có đơn hàng');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#343a40', fontWeight: '700', margin: 0 }}>QUẢN LÝ TOUR</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/tours/new')} style={{ borderRadius: '8px' }}>
          <FaPlus /> Thêm Tour Mới
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên Tour</th>
              <th>Danh mục</th>
              <th>Giá (VND)</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tours.map(tour => (
              <tr key={tour.id}>
                <td style={{ fontWeight: 'bold', color: '#6c757d' }}>#{tour.id}</td>
                <td>
                  <img src={tour.imageUrl || 'https://via.placeholder.com/60'} alt={tour.name} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ fontWeight: '600', color: '#1e3a8a', maxWidth: '250px' }}>{tour.name}</td>
                <td><span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>{tour.category?.name || 'N/A'}</span></td>
                <td style={{ fontWeight: '700', color: '#e8400c' }}>{new Intl.NumberFormat('vi-VN').format(tour.price)}</td>
                <td>
                  <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: tour.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2', color: tour.status === 'ACTIVE' ? '#059669' : '#dc2626' }}>
                    {tour.status === 'ACTIVE' ? 'HIỂN THỊ' : 'ĐÃ ẨN'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn-action btn-view" title="Xem" onClick={() => navigate(`/tours/${tour.id}`)}><FaEye /></button>
                  <button className="btn-action btn-edit" title="Sửa" onClick={() => navigate(`/admin/tours/${tour.id}/edit`)}><FaEdit /></button>
                  <button className="btn-action btn-delete" title="Xóa" onClick={() => handleDelete(tour.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tours.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>Chưa có tour nào trong hệ thống.</div>}
      </div>
    </div>
  );
};

export default AdminTours;
