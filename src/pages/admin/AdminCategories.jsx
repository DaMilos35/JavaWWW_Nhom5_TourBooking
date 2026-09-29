import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSearch, FaLayerGroup } from 'react-icons/fa';
import { adminApi, categoryApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentCat, setCurrentCat] = useState({ id: null, name: '', description: '', imageUrl: '' });

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCat({
        id: cat.id || cat.categoryId,
        name: cat.name || cat.categoryName,
        description: cat.description || '',
        imageUrl: cat.imageUrl || ''
      });
    } else {
      setCurrentCat({ id: null, name: '', description: '', imageUrl: '' });
    }
    setShowModal(true);
  };

  // Thêm mới hoặc cập nhật danh mục
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCat.name.trim()) {
      toast.warning('Tên danh mục không được để trống');
      return;
    }
    try {
      if (currentCat.id) {
        await adminApi.updateCategory(currentCat.id, currentCat);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await adminApi.createCategory(currentCat);
        toast.success('Thêm danh mục mới thành công');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    }
  };

  // Xóa danh mục
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await adminApi.deleteCategory(id);
        toast.success('Xóa danh mục thành công');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa danh mục đang chứa các tour');
      }
    }
  };

  const filteredCategories = categories.filter(c => {
    const name = (c.name || c.categoryName || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    const query = searchKeyword.toLowerCase().trim();
    return !query || name.includes(query) || desc.includes(query);
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Quản Lý Danh Mục Tour</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Phân loại tuyến tour: Trong nước, Quốc tế, Nghỉ dưỡng, Khám phá
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => handleOpenModal()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}
        >
          <FaPlus /> Thêm Danh Mục Mới
        </button>
      </div>

      {/* Search Input */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        maxWidth: '360px'
      }}>
        <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
        <input 
          type="text" 
          placeholder="Tìm kiếm danh mục..." 
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1e293b' }}
        />
      </div>

      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Mã</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hình ảnh</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Tên Danh Mục</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Mô Tả Chi Tiết</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Số Lượng Tour</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? filteredCategories.map(cat => (
                  <tr key={cat.id || cat.categoryId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>#{cat.id || cat.categoryId}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <img 
                        src={cat.imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=100&q=80'} 
                        alt="cat" 
                        style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                      {cat.name || cat.categoryName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem', maxWidth: '360px' }}>
                      {cat.description || 'Không có mô tả'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        <FaLayerGroup size={12} /> {cat.tourCount || 0} tour
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button 
                        style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }} 
                        onClick={() => handleOpenModal(cat)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }} 
                        onClick={() => handleDelete(cat.id || cat.categoryId)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Chưa có danh mục nào phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog Thêm / Sửa Danh Mục */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1050,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '28px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                {currentCat.id ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.9rem' }}>
                  Tên danh mục *
                </label>
                <input 
                  type="text" 
                  value={currentCat.name} 
                  onChange={(e) => setCurrentCat({...currentCat, name: e.target.value})} 
                  placeholder="VD: Tour Du Thuyền Hạ Long"
                  required 
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.9rem' }}>
                  URL Ảnh đại diện
                </label>
                <input 
                  type="url" 
                  value={currentCat.imageUrl} 
                  onChange={(e) => setCurrentCat({...currentCat, imageUrl: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px', fontSize: '0.9rem' }}>
                  Mô tả danh mục
                </label>
                <textarea 
                  value={currentCat.description} 
                  onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})}
                  rows="3"
                  placeholder="Mô tả tóm tắt điểm đặc sắc của dòng sản phẩm này..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0ea5e9',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Lưu Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
