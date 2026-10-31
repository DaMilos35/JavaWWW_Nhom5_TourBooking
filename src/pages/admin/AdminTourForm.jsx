import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, categoryApi, tourApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FallbackImage from '../../components/common/FallbackImage';
import { 
  FaSave, 
  FaArrowLeft, 
  FaInfoCircle, 
  FaHotel, 
  FaBus, 
  FaCalendarAlt, 
  FaTag, 
  FaListUl, 
  FaRoute, 
  FaCheckCircle, 
  FaTimesCircle,
  FaImage,
  FaCamera,
  FaLightbulb
} from 'react-icons/fa';

// Helper: chuyển đổi JSON array hoặc text từ DB sang dạng hiển thị nhiều dòng cho textarea
const formatListForInput = (val) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join('\n');
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'object') {
            return parsed.map(item => `Ngày ${item.day || ''}: ${item.title || ''}\n${item.content || ''}`).join('\n\n');
          }
          return parsed.join('\n');
        }
      } catch (_) {}
    }
    return val;
  }
  return '';
};

// Helper: chuyển text nhiều dòng từ textarea thành chuỗi JSON array lưu vào DB
const formatListForSubmit = (text) => {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (_) {}
  }
  const lines = trimmed.split('\n').map(l => l.trim().replace(/^[-*•✓✕x]\s*/, '')).filter(Boolean);
  return lines.length > 0 ? JSON.stringify(lines) : null;
};

// Helper: chuyển format lịch trình Ngày 1: ... sang chuỗi JSON array chuẩn
const formatItineraryForSubmit = (text) => {
  if (!text || !text.trim()) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      JSON.parse(trimmed);
      return trimmed;
    } catch (_) {}
  }
  const rawDays = trimmed.split(/(?=(?:NGÀY|Ngày|Day)\s*\d+[:\s-])/gi).filter(Boolean);
  if (rawDays.length > 0) {
    const days = rawDays.map((block, idx) => {
      const firstLineEnd = block.indexOf('\n');
      const titleLine = firstLineEnd !== -1 ? block.substring(0, firstLineEnd).trim() : block.trim();
      const body = firstLineEnd !== -1 ? block.substring(firstLineEnd).trim() : '';
      const dayMatch = titleLine.match(/(?:NGÀY|Ngày|Day)\s*(\d+)/i);
      const dayNum = dayMatch ? parseInt(dayMatch[1]) : (idx + 1);
      const cleanTitle = titleLine.replace(/^(?:NGÀY|Ngày|Day)\s*\d+[:\s-]*/i, '').trim() || `Khám phá ngày ${dayNum}`;
      return {
        day: dayNum,
        title: cleanTitle,
        content: body || cleanTitle
      };
    });
    return JSON.stringify(days);
  }
  return JSON.stringify([{ day: 1, title: 'Lịch trình chi tiết chuyến đi', content: trimmed }]);
};

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
    originalPrice: '',
    duration: '3',
    departureLocation: 'Hà Nội',
    vehicle: 'Máy bay khứ hồi & Xe du lịch đời mới Universe',
    hotelStar: 4,
    badge: 'BÁN CHẠY NHẤT',
    imageUrl: '',
    availableSeats: 20,
    startDate: '',
    endDate: '',
    rating: 4.8,
    status: 'ACTIVE',
    highlights: '',
    itinerary: '',
    inclusions: '',
    exclusions: ''
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
      setCategories(res.data || []);
      if (!isEdit && res.data && res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0].id || res.data[0].categoryId }));
      }
    } catch (error) {
      toast.error('Không thể tải danh mục tour');
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
        price: tour.price ?? '',
        originalPrice: tour.originalPrice ?? '',
        duration: tour.duration ?? '3',
        departureLocation: tour.departureLocation || '',
        vehicle: tour.vehicle || '',
        hotelStar: tour.hotelStar ?? 4,
        badge: tour.badge || '',
        imageUrl: tour.imageUrl || '',
        availableSeats: tour.availableSeats ?? 20,
        startDate: tour.startDate || '',
        endDate: tour.endDate || '',
        rating: tour.rating ?? 4.8,
        status: tour.status || 'ACTIVE',
        highlights: formatListForInput(tour.highlights),
        itinerary: formatListForInput(tour.itinerary),
        inclusions: formatListForInput(tour.inclusions),
        exclusions: formatListForInput(tour.exclusions)
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Tên tour không được để trống');
      return;
    }
    if (!formData.categoryId) {
      toast.warning('Vui lòng chọn danh mục tour');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.warning('Giá tour phải lớn hơn 0');
      return;
    }
    if (formData.originalPrice && parseFloat(formData.originalPrice) < parseFloat(formData.price)) {
      toast.warning('Giá gốc (trước giảm giá) không được nhỏ hơn giá bán thực tế');
      return;
    }
    if (formData.availableSeats !== undefined && formData.availableSeats !== '' && parseInt(formData.availableSeats) < 0) {
      toast.warning('Số lượng chỗ khả dụng không được nhỏ hơn 0');
      return;
    }
    if (formData.duration !== undefined && formData.duration !== '' && parseInt(formData.duration) < 1) {
      toast.warning('Thời lượng tour phải từ 1 ngày trở lên');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.warning('Ngày kết thúc tour không thể trước ngày bắt đầu khởi hành');
      return;
    }

    setSubmitting(true);
    try {
      const dataToSubmit = {
        name: formData.name.trim(),
        categoryId: parseInt(formData.categoryId),
        description: formData.description?.trim() || '',
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        duration: parseInt(formData.duration) || 1,
        departureLocation: formData.departureLocation?.trim() || 'TP. Hồ Chí Minh',
        vehicle: formData.vehicle?.trim() || null,
        hotelStar: parseInt(formData.hotelStar) || 3,
        badge: formData.badge?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || '',
        availableSeats: parseInt(formData.availableSeats) || 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        rating: parseFloat(formData.rating) || 5.0,
        status: formData.status || 'ACTIVE',
        highlights: formatListForSubmit(formData.highlights),
        itinerary: formatItineraryForSubmit(formData.itinerary),
        inclusions: formatListForSubmit(formData.inclusions),
        exclusions: formatListForSubmit(formData.exclusions)
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
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tour');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      {/* Header Điều Hướng */}
      <div className="content-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <button 
            type="button" 
            onClick={() => navigate('/admin/tours')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            <FaArrowLeft /> Quay lại danh sách
          </button>
          <h2 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            {isEdit ? `Chỉnh Sửa Tour #${id} – ${formData.name || ''}` : 'Thêm Tuyến Tour Du Lịch Mới'}
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Quản trị đầy đủ 18+ trường nghiệp vụ: Lịch trình chi tiết từng ngày, dịch vụ bao gồm, phương tiện, khách sạn & giá Traveloka.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/tours')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
          >
            Hủy bỏ
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#0ea5e9',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <FaSave /> {submitting ? 'Đang lưu...' : 'Lưu Tour'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Thông tin cơ bản & Giá bán */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaInfoCircle style={{ color: '#0ea5e9' }} /> 1. Thông Tin Cơ Bản & Định Giá Bán
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tên Tour Du Lịch *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="VD: Đà Nẵng - Bán Đảo Sơn Trà - Hội An - Bà Nà Hills 4N3Đ" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Danh Mục Tour *</label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleChange} 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id || c.categoryId} value={c.id || c.categoryId}>{c.name || c.categoryName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giá Bán Thực Tế (VNĐ) *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="VD: 4890000" 
                required 
                min="1000" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', color: '#ff5e1f', fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giá Gốc Niêm Yết (VNĐ) <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(hiển thị gạch giá)</span></label>
              <input 
                type="number" 
                name="originalPrice" 
                value={formData.originalPrice} 
                onChange={handleChange} 
                placeholder="VD: 5890000" 
                min="0" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Thời Lượng (Số Ngày) *</label>
              <input 
                type="number" 
                name="duration" 
                value={formData.duration} 
                onChange={handleChange} 
                placeholder="VD: 4" 
                required 
                min="1" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Điểm Khởi Hành *</label>
              <input 
                type="text" 
                name="departureLocation" 
                value={formData.departureLocation} 
                onChange={handleChange} 
                placeholder="VD: TP. Hồ Chí Minh hoặc Hà Nội" 
                required 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Tiêu chuẩn Dịch vụ, Khách sạn & Huy hiệu */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaHotel style={{ color: '#10b981' }} /> 2. Tiêu Chuẩn Lưu Trú, Phương Tiện & Tiếp Thị
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Phương Tiện Di Chuyển</label>
              <input 
                type="text" 
                name="vehicle" 
                value={formData.vehicle} 
                onChange={handleChange} 
                placeholder="VD: Máy bay khứ hồi Vietnam Airlines & Xe Universe" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tiêu Chuẩn Khách Sạn (Sao)</label>
              <select 
                name="hotelStar" 
                value={formData.hotelStar} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="1">Khách sạn 1 Sao</option>
                <option value="2">Khách sạn 2 Sao</option>
                <option value="3">Khách sạn 3 Sao</option>
                <option value="4">Khách sạn 4 Sao (Tiêu chuẩn cao cấp)</option>
                <option value="5">Khách sạn / Resort 5 Sao Thượng Lưu</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Huy Hiệu Tiếp Thị (Badge)</label>
              <select 
                name="badge" 
                value={formData.badge} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="">-- Không dùng huy hiệu --</option>
                <option value="BÁN CHẠY NHẤT">BÁN CHẠY NHẤT</option>
                <option value="5 SAO CAO CẤP">5 SAO CAO CẤP</option>
                <option value="ƯU ĐÃI ĐOÀN B2B">ƯU ĐÃI ĐOÀN B2B</option>
                <option value="HOT TUẦN NÀY">HOT TUẦN NÀY</option>
                <option value="GIÁ TỐT TRAVELOKA">GIÁ TỐT TRAVELOKA</option>
                <option value="DI SẢN UNESCO">DI SẢN UNESCO</option>
                <option value="LINH THIÊNG">LINH THIÊNG</option>
                <option value="MÙA ĐẸP NHẤT">MÙA ĐẸP NHẤT</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Số Chỗ Nhận Khách (Chỗ còn) *</label>
              <input 
                type="number" 
                name="availableSeats" 
                value={formData.availableSeats} 
                onChange={handleChange} 
                required 
                min="0" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Ngày Khởi Hành</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Ngày Kết Thúc</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Điểm Đánh Giá (0.0 - 5.0)</label>
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="5" 
                name="rating" 
                value={formData.rating} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Trạng Thái Mở Bán</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="ACTIVE">Hiển thị (Đang mở bán)</option>
                <option value="INACTIVE">Tạm ẩn (Đóng nhận khách)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Hình ảnh & Media */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaImage style={{ color: '#8b5cf6' }} /> 3. Hình Ảnh Đại Diện Tour
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'flex-start' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>URL Ảnh Trực Quan</label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://images.unsplash.com/..." 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', marginBottom: '12px' }}
              />

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '8px' }}>
                  <FaCamera style={{ marginRight: '6px' }} /> Chọn nhanh ảnh mẫu chất lượng cao:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Đà Nẵng Cầu Vàng', url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800' },
                    { label: 'Phú Quốc Biển Xanh', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800' },
                    { label: 'Hạ Long Kỳ Quan', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800' },
                    { label: 'Sa Pa Fansipan', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800' },
                    { label: 'Hà Giang Mã Pí Lèng', url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800' },
                    { label: 'Ninh Bình Tràng An', url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800' }
                  ].map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: item.url }))}
                      style={{
                        padding: '4px 10px',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        color: '#334155',
                        fontWeight: 500
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: '170px', borderRadius: '10px', overflow: 'hidden', border: '1.5px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {formData.imageUrl ? (
                <FallbackImage src={formData.imageUrl} alt="Xem trước ảnh tour" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <FaImage size={32} style={{ marginBottom: '6px' }} /><br />
                  Chưa có ảnh xem trước
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Mô tả & Điểm nhấn (Highlights) */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaListUl style={{ color: '#0284c7' }} /> 4. Giới Thiệu & Điểm Nhấn Nổi Bật (Highlights)
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giới Thiệu Tổng Quan Chuyến Đi</label>
            <textarea 
              name="description" 
              rows="4" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Hành trình được thiết kế chuyên nghiệp bởi đội ngũ lữ hành..." 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Điểm Nhấn Đặc Sắc (Highlights) <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(Mỗi dòng 1 điểm nhấn, hiển thị dấu tích xanh)</span>
            </label>
            <textarea 
              name="highlights" 
              rows="5" 
              value={formData.highlights} 
              onChange={handleChange} 
              placeholder={`Check-in Cầu Vàng lừng danh thế giới trên đỉnh Bà Nà Hills\nDu ngoạn phố cổ Hội An về đêm ngắm đèn lồng và thả hoa đăng sông Hoài\nTắm biển Mỹ Khê - một trong những bãi biển quyến rũ nhất hành tinh\nThưởng thức đặc sản mì Quảng, bánh tráng cuốn thịt heo`} 
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Section 5: Lịch trình chi tiết từng ngày (Itinerary) */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaRoute style={{ color: '#ea580c' }} /> 5. Lịch Trình Chi Tiết Từng Ngày (Itinerary Timeline)
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b' }}>
            <FaLightbulb style={{ color: '#f59e0b', marginRight: '6px' }} /> Cú pháp tự nhiên: Bắt đầu mỗi ngày bằng <b>Ngày 1: [Tiêu đề ngày]</b>, sau đó xuống dòng là nội dung các hoạt động. Hệ thống sẽ tự động bóc tách thành các thẻ Ngày 1, Ngày 2 chuẩn giao diện Traveloka.
          </p>
          <textarea 
            name="itinerary" 
            rows="10" 
            value={formData.itinerary} 
            onChange={handleChange} 
            placeholder={`Ngày 1: TP.HCM / Hà Nội - Đà Nẵng - Bán Đảo Sơn Trà\nĐáp chuyến bay đến Đà Nẵng. Xe đón đoàn viếng Chùa Linh Ứng Bãi Bụt, chiêm ngưỡng tượng Phật Bà Quan Âm 67m. Chiều tự do tắm biển Mỹ Khê.\n\nNgày 2: KDL Sun World Ba Na Hills - Check-in Cầu Vàng\nTrải nghiệm cáp treo đạt 4 kỷ lục thế giới. Check-in Cầu Vàng bàn tay khổng lồ, Làng Pháp cổ kính, Hầm rượu Debay và Vườn hoa Le Jardin D'Amour.\n\nNgày 3: Ngũ Hành Sơn - Làng Đá Non Nước - Phố Cổ Hội An\nKhám phá quần thể hang động Ngũ Hành Sơn. Chiều di chuyển về Phố Cổ Hội An: Chùa Cầu Nhật Bản, thả đèn hoa đăng sông Hoài.\n\nNgày 4: Chợ Hàn Mua Sắm Đặc Sản - Tiễn Sân Bay\nGhé Chợ Hàn mua sắm chả bò Đà Nẵng, mực một nắng. Xe đưa đoàn ra sân bay Đà Nẵng kết thúc chuyến đi.`} 
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.95rem', lineHeight: 1.65, fontFamily: 'inherit' }}
          />
        </div>

        {/* Section 6: Dịch vụ bao gồm & Không bao gồm */}
        <div className="admin-card" style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <FaCheckCircle style={{ color: '#16a34a' }} /> 6. Dịch Vụ Đi Kèm (Bao Gồm & Không Bao Gồm)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#15803d', marginBottom: '6px' }}>
                <FaCheckCircle style={{ marginRight: '6px' }} /> Dịch Vụ Bao Gồm Trọn Gói (Mỗi dòng 1 dịch vụ)
              </label>
              <textarea 
                name="inclusions" 
                rows="6" 
                value={formData.inclusions} 
                onChange={handleChange} 
                placeholder={`Vé máy bay khứ hồi bao gồm 20kg hành lý ký gửi + 7kg xách tay\nKhách sạn 4 sao tiêu chuẩn quốc tế gần biển (2 khách/phòng)\nXe du lịch đời mới Universe máy lạnh đón tiễn theo lịch trình\nVé cáp treo và buffet trưa thượng hạng tại Bà Nà Hills\nBảo hiểm du lịch nội địa mức bồi thường 100.000.000 VNĐ/khách`} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #bbf7d0', background: '#f0fdf4', fontSize: '0.92rem', lineHeight: 1.6 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, color: '#dc2626', marginBottom: '6px' }}>
                <FaTimesCircle style={{ marginRight: '6px' }} /> Dịch Vụ Không Bao Gồm (Mỗi dòng 1 mục)
              </label>
              <textarea 
                name="exclusions" 
                rows="6" 
                value={formData.exclusions} 
                onChange={handleChange} 
                placeholder={`Chi phí cá nhân ngoài chương trình (giặt ủi, đồ uống minibar)\nVé tham quan Bảo tàng Tượng sáp\nThuế VAT 8% (nếu xuất hóa đơn đỏ)\nTiền bồi dưỡng cho Hướng dẫn viên và Tài xế`} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #fecaca', background: '#fef2f2', fontSize: '0.92rem', lineHeight: 1.6 }}
              />
            </div>
          </div>
        </div>

        {/* Floating / Bottom Sticky Action Bar */}
        <div style={{
          position: 'sticky',
          bottom: '16px',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 24px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 50
        }}>
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {isEdit ? 'Đang chỉnh sửa tour hiện hữu' : 'Đang tạo mới tour du lịch'} · Kiểm tra thông tin kỹ trước khi lưu
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 28px',
                borderRadius: '8px',
                border: 'none',
                background: '#0ea5e9',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              <FaSave /> {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminTourForm;
