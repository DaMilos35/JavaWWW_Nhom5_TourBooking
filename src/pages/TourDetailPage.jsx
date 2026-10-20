import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUserFriends, FaShoppingCart, FaBolt, FaHeart } from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FallbackImage from '../components/common/FallbackImage';
import { toast } from 'react-toastify';
import { formatTourDate, hasTourDatePassed } from '../utils/tourDate';
import TourCard from '../components/tours/TourCard';
import './TourDetailPage.css';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useWishlist();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'services' | 'policy'
  const [recommendedTours, setRecommendedTours] = useState([]);

  // Tải thông tin chi tiết tour
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourApi.getById(id);
        setTour(res.data);
        
        // Tải các tour gợi ý cá nhân hóa dựa trên lịch sử hoạt động
        try {
          const recRes = await tourApi.getRecommendations('', 4);
          if (recRes.data && Array.isArray(recRes.data)) {
            // Lọc không hiển thị tour hiện tại
            setRecommendedTours(recRes.data.filter(t => t.id !== Number(id)).slice(0, 3));
          }
        } catch (e) {
          console.debug('Không tải được gợi ý tour:', e);
        }
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
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    addToCart(tour, quantity);
  };

  // Đặt ngay -> chuyển sang trang giỏ hàng / thanh toán
  const handleBuyNow = () => {
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    if (addToCart(tour, quantity)) {
      navigate('/checkout');
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tour) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  const departureHasPassed = hasTourDatePassed(tour.startDate || tour.endDate);
  const availableSeats = Number(tour.availableSeats) || 0;

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
          <div className="td-title-row">
            <h1 className="td-title">{tour.name || tour.tourName}</h1>
            <button
              type="button"
              className={`td-save-btn${isSaved(tour) ? ' is-saved' : ''}`}
              aria-pressed={isSaved(tour)}
              onClick={() => toggleSaved(tour)}
            >
              <FaHeart aria-hidden="true" />
              {isSaved(tour) ? 'Đã lưu' : 'Lưu tour'}
            </button>
          </div>
          <div className="td-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
          <FallbackImage
            src={tour.imageUrl}
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
                  <b>
                    {formatTourDate(tour.startDate) || 'Chưa cập nhật'}
                    {formatTourDate(tour.endDate) && ` – ${formatTourDate(tour.endDate)}`}
                  </b>
                </div>
              </div>
              <div className="hl-item">
                <FaUserFriends className="hl-icon" /> 
                <div className="hl-text">
                  <span>Chỗ còn trống</span>
                  <b>{availableSeats} chỗ</b>
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
                Thông tin tour
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
                Dịch vụ
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
                Đổi / hủy
              </button>
            </div>

            {/* Tab 1: Itinerary */}
            {activeTab === 'itinerary' && (
              <div>
                <div className="td-section mb-4">
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '12px' }}>Thông tin hành trình</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '1rem' }}>
                    {tour.description || 'Chưa có mô tả chi tiết cho tour này.'}
                  </p>
                </div>

                <div className="td-section">
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '16px' }}>Lịch trình chi tiết theo ngày</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Array.from({ length: Math.max(1, tour.duration || 3) }).map((_, idx) => (
                      <div key={idx} style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderLeft: '4px solid #0ea5e9',
                        borderRadius: '0 8px 8px 0',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ background: '#0ea5e9', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem' }}>
                            NGÀY {idx + 1}
                          </span>
                          <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
                            {idx === 0 ? `Khởi hành từ ${tour.departureLocation || 'điểm hẹn'} - Check-in điểm đến` :
                             idx === (tour.duration || 3) - 1 ? 'Tự do mua sắm đặc sản - Kết thúc hành trình' :
                             `Khám phá danh lam thắng cảnh & Trải nghiệm văn hóa địa phương`}
                          </h4>
                        </div>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>
                          {idx === 0 ? `Xe và hướng dẫn viên đón đoàn tại điểm hẹn, khởi hành đi ${tour.name || 'điểm đến'}. Đoàn ăn trưa tại nhà hàng, nhận phòng nghỉ ngơi và bắt đầu tham quan các điểm nổi bật buổi chiều.` :
                           idx === (tour.duration || 3) - 1 ? 'Đoàn dùng điểm tâm sáng, tự do dạo phố, chụp ảnh và mua sắm quà lưu niệm cho người thân. Sau bữa trưa, xe đưa đoàn về lại điểm đón ban đầu, chia tay và hẹn gặp lại.' :
                           'Đoàn thưởng thức bữa sáng buffet, sau đó di chuyển tham quan các danh lam thắng cảnh tiêu biểu, trải nghiệm các hoạt động giải trí đặc sắc và thưởng thức ẩm thực truyền thống.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Services */}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#10b981', fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✓ Dịch vụ bao gồm trong tour
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <li>Xe du lịch đời mới máy lạnh phục vụ đưa đón suốt lịch trình</li>
                    <li>Khách sạn tiêu chuẩn 3 - 4 sao tiện nghi (nghỉ 2 khách/phòng, lẻ nam/nữ ghép 3)</li>
                    <li>Các bữa ăn theo chương trình (bữa sáng tại khách sạn, bữa chính tại nhà hàng)</li>
                    <li>Vé vào cổng tham quan tất cả các thắng cảnh có trong chương trình</li>
                    <li>Hướng dẫn viên du lịch chuyên nghiệp, nhiệt tình, am hiểu văn hóa</li>
                    <li>Bảo hiểm du lịch trọn gói mức bồi thường tối đa 50.000.000 VNĐ / vụ</li>
                    <li>Khăn lạnh và nước suối tinh khiết phục vụ hàng ngày</li>
                  </ul>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#ef4444', fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✕ Dịch vụ không bao gồm
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', lineHeight: 1.8, fontSize: '0.95rem' }}>
                    <li>Chi phí cá nhân: giặt ủi, điện thoại, đồ uống trong minibar khách sạn</li>
                    <li>Phụ thu phòng đơn đối với khách đi 1 mình không ghép phòng</li>
                    <li>Tiền bồi dưỡng (tip) cho tài xế và hướng dẫn viên (tự nguyện)</li>
                    <li>Thuế VAT 8% (nếu quý khách có nhu cầu xuất hóa đơn đỏ công ty)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Policy */}
            {activeTab === 'policy' && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: '#f59e0b', fontSize: '1.15rem', marginBottom: '14px' }}>
                  Chính sách đặt, đổi và hoàn hủy tour
                </h3>
                <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p><strong>1. Quy trình đặt tour:</strong> Sau khi gửi yêu cầu trực tuyến, hệ thống sẽ tạm giữ chỗ và gửi email xác nhận. Nhân viên tư vấn sẽ liên hệ để xác nhận thông tin.</p>
                  <p><strong>2. Hủy tour trước 7 ngày:</strong> Hoàn trả 100% số tiền hoặc chuyển đổi sang hành trình khác miễn phí.</p>
                  <p><strong>3. Hủy tour từ 3 - 6 ngày:</strong> Phí đổi hủy 30% giá tour.</p>
                  <p><strong>4. Hủy tour trong vòng 48h trước giờ khởi hành:</strong> Phí đổi hủy 70% giá tour.</p>
                  <p><strong>5. Trường hợp bất khả kháng:</strong> (Thiên tai, dịch bệnh, hoãn chuyến bay) Du Lịch Việt hỗ trợ dời lịch trình hoặc bảo lưu giá trị tour lên đến 12 tháng.</p>
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
                  <button type="button" aria-label="Giảm số lượng vé" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button
                    type="button"
                    aria-label="Tăng số lượng vé"
                    disabled={quantity >= availableSeats}
                    onClick={() => setQuantity(q => Math.min(availableSeats, q + 1))}
                  >+</button>
                </div>
                <small style={{ color: '#94a3b8', marginTop: '6px', display: 'block' }}>
                  {departureHasPassed
                    ? 'Ngày khởi hành đã qua; cần cập nhật lịch trước khi đặt'
                    : availableSeats > 0
                      ? `Còn ${availableSeats} chỗ theo dữ liệu hiện tại`
                      : 'Hiện không còn chỗ'}
                </small>
              </div>

              <div className="total-box">
                <span>Tổng tạm tính:</span>
                <span className="total-price">{formatPrice(tour.price * quantity)}</span>
              </div>

              <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary btn-full" disabled={!availableSeats || departureHasPassed} onClick={handleBuyNow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaBolt /> {departureHasPassed ? 'Lịch khởi hành đã qua' : availableSeats ? 'Gửi yêu cầu đặt tour' : 'Hiện hết chỗ'}
                </button>
                <button className="btn btn-outline btn-full" disabled={!availableSeats || departureHasPassed} onClick={handleAddToCart} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaShoppingCart /> {departureHasPassed ? 'Lịch khởi hành đã qua' : availableSeats ? 'Thêm vào giỏ hàng' : 'Hiện hết chỗ'}
                </button>
              </div>
              
              <div className="support-info mt-4" style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Đơn sẽ ở trạng thái chờ xử lý cho đến khi được xác nhận.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendedTours && recommendedTours.length > 0 && (
          <div className="td-recommendations mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> Gợi ý tour tương tự dành riêng cho bạn
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
                Hệ thống đề xuất dựa trên sở thích danh mục và hành vi xem tour gần đây của bạn.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {recommendedTours.map((item) => (
                <TourCard key={item.id} tour={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetailPage;
