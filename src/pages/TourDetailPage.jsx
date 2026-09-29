import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUserFriends, FaStar, FaCheck, FaTimes, FaShoppingCart, FaBolt, FaPhoneAlt, FaShieldAlt } from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './TourDetailPage.css';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'services' | 'policy'

  // Tải thông tin chi tiết tour
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourApi.getById(id);
        setTour(res.data);
      } catch (error) {
        toast.error('Không thể tải thông tin tour');
        navigate('/tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, navigate]);

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    addToCart(tour, quantity);
  };

  // Đặt ngay -> chuyển sang trang giỏ hàng / thanh toán
  const handleBuyNow = () => {
    addToCart(tour, quantity);
    navigate('/checkout');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tour) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Tạo lịch trình mẫu theo số ngày của tour
  const durationDays = tour.duration || 3;
  const sampleItinerary = Array.from({ length: durationDays }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Ngày 1: Khởi hành từ ${tour.departureLocation} - Nhận phòng & Tham quan mở đầu` :
           i === durationDays - 1 ? `Ngày ${durationDays}: Tự do mua sắm đặc sản - Trả phòng & Trở về điểm hẹn ban đầu` :
           `Ngày ${i + 1}: Trải nghiệm điểm tham quan biểu tượng & Khám phá văn hóa ẩm thực địa phương`,
    morning: `07:30 - Thưởng thức bữa sáng tại khách sạn. 08:30 - Xe và HDV đón đoàn khởi hành tham quan danh thắng nổi bật trong hành trình.`,
    afternoon: `12:00 - Dùng bữa trưa đặc sản vùng miền. 14:00 - Trải nghiệm hoạt động văn hóa, ngắm cảnh và chụp ảnh kỷ niệm.`,
    evening: `18:30 - Dùng bữa tối hải sản / ẩm thực địa phương. Tự do dạo chơi phố đêm, mua sắm đồ lưu niệm.`
  }));

  return (
    <div className="tour-detail-page">
      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <div className="td-header mb-4">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Trang chủ</span> {'>'}{' '}
            <span onClick={() => navigate('/tours')}>Khám phá tour</span> {'>'}{' '}
            <span className="active">{tour.name || tour.tourName}</span>
          </div>
          <h1 className="td-title">{tour.name || tour.tourName}</h1>
          <div className="td-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span className="rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700 }}>
              <FaStar /> {tour.rating || '4.9'} / 5.0 (Tuyệt vời)
            </span>
            {tour.category && (
              <span className="badge-cat" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                {tour.category.name || tour.category.categoryName}
              </span>
            )}
            <span className="location" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <FaMapMarkerAlt /> Khởi hành từ: <b style={{ color: '#fff' }}>{tour.departureLocation}</b>
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="td-gallery mb-4">
          <img 
            src={tour.imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80'} 
            alt={tour.name || tour.tourName} 
            className="main-img" 
          />
        </div>

        {/* Content Layout */}
        <div className="td-layout">
          {/* Main Info */}
          <div className="td-main">
            {/* Quick Highlights Bar */}
            <div className="td-highlights mb-4">
              <div className="hl-item">
                <FaClock className="hl-icon" /> 
                <div className="hl-text">
                  <span>Thời lượng</span>
                  <b>{tour.duration} Ngày {Math.max(1, tour.duration - 1)} Đêm</b>
                </div>
              </div>
              <div className="hl-item">
                <FaCalendarAlt className="hl-icon" /> 
                <div className="hl-text">
                  <span>Lịch khởi hành</span>
                  <b>Thứ 6 hàng tuần & Ngày lễ</b>
                </div>
              </div>
              <div className="hl-item">
                <FaUserFriends className="hl-icon" /> 
                <div className="hl-text">
                  <span>Chỗ còn trống</span>
                  <b>{tour.availableSeats || 10} chỗ</b>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('itinerary')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'itinerary' ? '2px solid #0ea5e9' : '2px solid transparent',
                  color: activeTab === 'itinerary' ? '#0ea5e9' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Lịch trình chi tiết
              </button>
              <button 
                onClick={() => setActiveTab('services')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'services' ? '2px solid #0ea5e9' : '2px solid transparent',
                  color: activeTab === 'services' ? '#0ea5e9' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Dịch vụ bao gồm
              </button>
              <button 
                onClick={() => setActiveTab('policy')}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'policy' ? '2px solid #0ea5e9' : '2px solid transparent',
                  color: activeTab === 'policy' ? '#0ea5e9' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Chính sách hoàn hủy
              </button>
            </div>

            {/* Tab 1: Itinerary */}
            {activeTab === 'itinerary' && (
              <div>
                <div className="td-section mb-4">
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '12px' }}>Điểm nhấn chuyến đi</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '1rem' }}>
                    {tour.description}
                  </p>
                </div>

                <div className="td-section">
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '20px' }}>Chương trình từng ngày</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {sampleItinerary.map((item) => (
                      <div key={item.day} style={{ background: '#1c2434', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h4 style={{ color: '#38bdf8', margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700 }}>
                          {item.title}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6 }}>
                          <div><strong style={{ color: '#e2e8f0' }}>Buổi sáng:</strong> {item.morning}</div>
                          <div><strong style={{ color: '#e2e8f0' }}>Buổi trưa:</strong> {item.afternoon}</div>
                          <div><strong style={{ color: '#e2e8f0' }}>Buổi tối:</strong> {item.evening}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Services */}
            {activeTab === 'services' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div style={{ background: '#1c2434', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', fontSize: '1.1rem' }}>
                    <FaCheck /> Dịch vụ Đã Bao Gồm
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                    <li>✓ Xe du lịch đời mới đưa đón suốt hành trình</li>
                    <li>✓ Khách sạn tiêu chuẩn 4 - 5 sao (2 khách/phòng)</li>
                    <li>✓ Các bữa ăn chính theo tiêu chuẩn thực đơn phong phú</li>
                    <li>✓ Vé tham quan tất cả các điểm theo chương trình</li>
                    <li>✓ Hướng dẫn viên nhiệt tình, tận tâm suốt tuyến</li>
                    <li>✓ Bảo hiểm du lịch với mức bồi thường tới 100.000.000đ/vụ</li>
                    <li>✓ Nước khoáng 1 chai/khách/ngày và khăn lạnh</li>
                  </ul>
                </div>

                <div style={{ background: '#1c2434', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px', fontSize: '1.1rem' }}>
                    <FaTimes /> Dịch vụ Chưa Bao Gồm
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1', fontSize: '0.95rem' }}>
                    <li>✕ Chi tiêu cá nhân ngoài chương trình (giặt ủi, đồ uống...)</li>
                    <li>✕ Phụ thu phòng đơn (nếu có nhu cầu ngủ riêng)</li>
                    <li>✕ Tiền bồi dưỡng (tip) cho tài xế và hướng dẫn viên</li>
                    <li>✕ Thuế VAT (nếu quý khách có nhu cầu xuất hóa đơn đỏ)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Policy */}
            {activeTab === 'policy' && (
              <div style={{ background: '#1c2434', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1', lineHeight: 1.8 }}>
                <h4 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1.1rem' }}>Điều kiện hủy đổi tour</h4>
                <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                  <li>Hủy trước 07 ngày so với ngày khởi hành: <b>Miễn phí 100%</b> và hoàn tiền trong 24h.</li>
                  <li>Hủy từ 03 đến 06 ngày trước ngày khởi hành: Phí hủy 30% giá tour.</li>
                  <li>Hủy trong vòng 48 giờ trước giờ khởi hành: Phí hủy 50% giá tour.</li>
                  <li>Hỗ trợ chuyển đổi sang chuyến khởi hành khác miễn phí 01 lần nếu báo trước 05 ngày.</li>
                </ul>
                <div style={{ padding: '16px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaShieldAlt style={{ color: '#0ea5e9', fontSize: '1.5rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>
                    Cam kết giữ đúng giá tour đã niêm yết, không phát sinh phụ phí ẩn khi tham gia chuyến đi.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="td-sidebar">
            <div className="booking-card">
              <div className="price-box">
                <span className="price">{formatPrice(tour.price)}</span>
                <span className="price-unit">/ 1 vé người lớn</span>
              </div>
              
              <div className="quantity-box">
                <label>Số lượng vé tham gia:</label>
                <div className="qty-controls">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button type="button" onClick={() => setQuantity(q => Math.min(tour.availableSeats || 10, q + 1))}>+</button>
                </div>
                <small style={{ color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  Chỉ còn {tour.availableSeats} chỗ trống cho chuyến này
                </small>
              </div>

              <div className="total-box">
                <span>Tổng tạm tính:</span>
                <span className="total-price">{formatPrice(tour.price * quantity)}</span>
              </div>

              <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary btn-full" onClick={handleBuyNow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaBolt /> Đặt Vé Ngay
                </button>
                <button className="btn btn-outline btn-full" onClick={handleAddToCart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaShoppingCart /> Thêm Vào Giỏ Hàng
                </button>
              </div>
              
              <div className="support-info mt-4" style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <p style={{ color: '#94a3b8', margin: '0 0 4px', fontSize: '0.85rem' }}>Tổng đài hỗ trợ tư vấn 24/7</p>
                <h4 style={{ color: '#0ea5e9', margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FaPhoneAlt size={14} /> 1900 123 456
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
