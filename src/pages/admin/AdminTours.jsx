import React, { useState, useEffect } from 'react';
import { adminApi, categoryApi } from '../../api/axiosConfig';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaToggleOn, FaToggleOff, FaFileExcel } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FallbackImage from '../../components/common/FallbackImage';

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();

  // Tải danh sách tour và danh mục
  const fetchToursAndCats = async () => {
    try {
      const [toursRes, catsRes] = await Promise.all([
        adminApi.getTours(),
        categoryApi.getAll()
      ]);
      setTours(toursRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu tour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToursAndCats();
  }, []);

  // Xóa tour
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này khỏi hệ thống?')) {
      try {
        await adminApi.deleteTour(id);
        toast.success('Đã xóa tour thành công');
        fetchToursAndCats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể xóa tour đang có trong đơn hàng');
      }
    }
  };

  // Bật / tắt nhanh trạng thái mở bán của tour
  const handleToggleStatus = async (tour) => {
    const newStatus = tour.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateTour(tour.id, {
        categoryId: parseInt(tour.categoryId || tour.category?.id || tour.category?.categoryId || 1),
        name: tour.name || tour.tourName || 'Tour Du Lịch',
        description: tour.description || '',
        price: parseFloat(tour.price || 1000000),
        originalPrice: tour.originalPrice ? parseFloat(tour.originalPrice) : null,
        duration: parseInt(tour.duration) || 1,
        departureLocation: tour.departureLocation || 'TP. Hồ Chí Minh',
        vehicle: tour.vehicle || 'Xe du lịch cao cấp',
        hotelStar: parseInt(tour.hotelStar) || 3,
        badge: tour.badge || null,
        highlights: tour.highlights || null,
        itinerary: tour.itinerary || null,
        inclusions: tour.inclusions || null,
        exclusions: tour.exclusions || null,
        imageUrl: tour.imageUrl || '',
        availableSeats: parseInt(tour.availableSeats) >= 0 ? parseInt(tour.availableSeats) : 20,
        startDate: tour.startDate || null,
        endDate: tour.endDate || null,
        status: newStatus,
        rating: parseFloat(tour.rating) || 5.0
      });
      toast.success(`Đã chuyển tour sang: ${newStatus === 'ACTIVE' ? 'Đang mở bán' : 'Tạm ẩn'}`);
      setTours(prev => prev.map(t => t.id === tour.id ? { ...t, status: newStatus } : t));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái tour');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Lọc dữ liệu tìm kiếm
  const filteredTours = tours.filter(t => {
    const matchesKeyword = !searchKeyword.trim() || 
      (t.name || t.tourName || '').toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (t.departureLocation || '').toLowerCase().includes(searchKeyword.toLowerCase());
    
    const matchesCategory = filterCategory === 'ALL' || 
      String(t.categoryId) === String(filterCategory) ||
      (t.category && String(t.category.id || t.category.categoryId) === String(filterCategory));
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesKeyword && matchesCategory && matchesStatus;
  });

  const activeCount = tours.filter(t => t.status === 'ACTIVE').length;
  const inactiveCount = tours.filter(t => t.status === 'INACTIVE').length;

  const [exporting, setExporting] = useState(false);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportToursCsv();
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_tour_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Xuất file Excel CSV danh sách tour thành công!');
    } catch {
      // Client-side fallback export
      try {
        const BOM = '\uFEFF';
        let csvContent = BOM + 'Mã Tour,Tên Tour,Danh Mục,Giá Bán,Giá Gốc,Số Chỗ,Thời Lượng,Điểm Khởi Hành,Trạng Thái\n';
        tours.forEach(t => {
          const id = t.id || '';
          const name = `"${(t.name || t.tourName || '').replace(/"/g, '""')}"`;
          const cat = `"${(t.category?.name || t.categoryName || 'Du lịch').replace(/"/g, '""')}"`;
          const price = t.price || 0;
          const origPrice = t.originalPrice || price;
          const seats = t.availableSeats || 0;
          const dur = t.duration || 1;
          const dep = `"${(t.departureLocation || '').replace(/"/g, '""')}"`;
          const st = t.status || 'ACTIVE';
          csvContent += `${id},${name},${cat},${price},${origPrice},${seats},${dur},${dep},${st}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `danh_sach_tour_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Xuất file Excel CSV danh sách tour thành công!');
      } catch (err) {
        toast.error('Lỗi xuất file: ' + err.message);
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>Quản Lý Tour Du Lịch</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Tổng cộng {tours.length} tour ({activeCount} đang mở bán · {inactiveCount} tạm ẩn)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            type="button"
            className="btn btn-outline"
            onClick={handleExportCsv}
            disabled={exporting || tours.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderColor: '#059669',
              color: '#059669',
              background: '#ffffff'
            }}
            title="Xuất file CSV danh sách tour mở được trên Excel"
          >
            <FaFileExcel /> {exporting ? 'Đang xuất...' : 'Xuất Excel / CSV'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/admin/tours/new')} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px' }}
          >
            <FaPlus /> Thêm Tour Mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', flex: 1, minWidth: '240px' }}>
          <FaSearch style={{ color: '#94a3b8', marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên tour, nơi khởi hành..." 
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1e293b' }}
          />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Danh mục:</span>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', background: '#fff' }}
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.name || c.categoryName}</option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Trạng thái:</span>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', background: '#fff' }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang mở bán</option>
            <option value="INACTIVE">Tạm ẩn</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="admin-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Mã</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hình ảnh</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Tên Tour</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Danh mục</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Giá Tour</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Chỗ còn</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredTours.map(tour => {
                  const isActive = tour.status === 'ACTIVE';
                  return (
                    <tr key={tour.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>#{tour.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <FallbackImage
                          src={tour.imageUrl}
                          alt={tour.name} 
                          style={{ width: '64px', height: '46px', objectFit: 'cover', borderRadius: '6px' }} 
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', maxWidth: '280px' }}>
                        <div>{tour.name || tour.tourName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>Khởi hành: {tour.departureLocation} · {tour.duration} ngày</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
                          {tour.categoryName || tour.category?.name || categories.find(c => String(c.id || c.categoryId) === String(tour.categoryId))?.name || 'Tất cả'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#e8400c' }}>
                        {formatPrice(tour.price)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                        {tour.availableSeats} chỗ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleToggleStatus(tour)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: isActive ? '#dcfce7' : '#fee2e2',
                            color: isActive ? '#15803d' : '#b91c1c'
                          }}
                          title="Bấm để bật/tắt trạng thái"
                        >
                          {isActive ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                          {isActive ? 'Mở bán' : 'Tạm ẩn'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button 
                            style={{ background: '#f1f5f9', color: '#0ea5e9', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} 
                            title="Xem trên web" 
                            onClick={() => navigate(`/tours/${tour.id}`)}
                          >
                            <FaEye />
                          </button>
                          <button 
                            style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} 
                            title="Chỉnh sửa" 
                            onClick={() => navigate(`/admin/tours/${tour.id}/edit`)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }} 
                            title="Xóa tour" 
                            onClick={() => handleDelete(tour.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTours.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Không tìm thấy tour nào phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTours;
