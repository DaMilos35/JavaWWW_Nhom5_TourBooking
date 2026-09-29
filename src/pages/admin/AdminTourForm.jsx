import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, categoryApi, tourApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTourForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    duration: '3',
    departureLocation: 'Hà Nội',
    imageUrl: '',
    availableSeats: 20,
    status: 'ACTIVE',
    rating: 4.8
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchTour();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
      if (!isEdit && res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0].id || res.data[0].categoryId }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTour = async () => {
    try {
      const res = await tourApi.getById(id);
      const tour = res.data;
      setFormData({
        name: tour.name || tour.tourName || '',
        categoryId: tour.category?.id || tour.categoryId || '',
        description: tour.description || '',
        price: tour.price || '',
        duration: tour.duration || '3',
        departureLocation: tour.departureLocation || '',
        imageUrl: tour.imageUrl || '',
        availableSeats: tour.availableSeats || 20,
        status: tour.status || 'ACTIVE',
        rating: tour.rating || 4.8
      });
    } catch (error) {
      toast.error('Không thể tải dữ liệu tour');
      navigate('/admin/tours');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration) || 1,
        availableSeats: parseInt(formData.availableSeats),
        rating: parseFloat(formData.rating),
        categoryId: parseInt(formData.categoryId)
      };

      if (isEdit) {
        await adminApi.updateTour(id, dataToSubmit);
        toast.success('Cập nhật tour thành công');
      } else {
        await adminApi.createTour(dataToSubmit);
        toast.success('Thêm tour mới thành công');
      }
      navigate('/admin/tours');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4">
        <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>
          {isEdit ? 'Chỉnh Sửa Thông Tin Tour' : 'Thêm Tour Du Lịch Mới'}
        </h2>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
          Điền các thông tin chi tiết về lịch trình, giá cả và hình ảnh tour
        </p>
      </div>

      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Left Main Form */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tên Tour *</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="VD: Hạ Long - Vịnh Lan Hạ 3N2Đ" 
                  required 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Danh mục *</label>
                  <select 
                    name="categoryId" 
                    value={formData.categoryId} 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(c => (
                      <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.name || c.categoryName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giá (VNĐ) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="VD: 4500000" 
                    required 
                    min="0" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Thời lượng (Số ngày) *</label>
                  <input 
                    type="number" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleChange} 
                    placeholder="VD: 3" 
                    required 
                    min="1" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Nơi khởi hành *</label>
                  <input 
                    type="text" 
                    name="departureLocation" 
                    value={formData.departureLocation} 
                    onChange={handleChange} 
                    placeholder="VD: Hà Nội hoặc TP. Hồ Chí Minh" 
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mô tả chi tiết chuyến đi</label>
                <textarea 
                  name="description" 
                  rows="7" 
                  value={formData.description} 
                  onChange={handleChange}
                  placeholder="Giới thiệu hành trình, các điểm tham quan nổi bật và dịch vụ bao gồm..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', lineHeight: 1.6 }}
                ></textarea>
              </div>
            </div>

            {/* Right Meta Column */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>URL Ảnh đại diện</label>
                <input 
                  type="url" 
                  name="imageUrl" 
                  value={formData.imageUrl} 
                  onChange={handleChange} 
                  placeholder="https://images.unsplash.com/..." 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', height: '140px', border: '1px solid #e2e8f0' }}>
                    <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {/* Gợi ý ảnh nhanh chất lượng cao cho admin */}
                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Gợi ý ảnh mẫu nhanh:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Hạ Long', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&q=80' },
                      { label: 'Đà Nẵng', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1000&q=80' },
                      { label: 'Phú Quốc', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80' },
                      { label: 'Sapa', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80' },
                      { label: 'Nhật Bản', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1000&q=80' },
                      { label: 'Thái Lan', url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1000&q=80' },
                    ].map(sample => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: sample.url })}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Số chỗ trống *</label>
                <input 
                  type="number" 
                  name="availableSeats" 
                  value={formData.availableSeats} 
                  onChange={handleChange} 
                  required 
                  min="1" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Điểm đánh giá (0 - 5.0)</label>
                <input 
                  type="number" 
                  name="rating" 
                  value={formData.rating} 
                  onChange={handleChange} 
                  step="0.1" 
                  min="0" 
                  max="5" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Trạng thái hiển thị</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="ACTIVE">Hiển thị (Đang mở bán)</option>
                  <option value="INACTIVE">Tạm ẩn / Đóng tour</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => navigate('/admin/tours')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              {submitting ? 'Đang lưu...' : 'Lưu Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTourForm;
