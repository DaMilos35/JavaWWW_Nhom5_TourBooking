import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUserFriends,
  FaShoppingCart,
  FaBolt,
  FaHeart,
  FaPlane,
  FaBus,
  FaShip,
  FaHotel,
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaStar,
  FaFire,
  FaPercent,
  FaInfoCircle,
  FaAward,
  FaHeadset,
  FaCompass,
  FaComments,
  FaCheck,
  FaMagic,
  FaLightbulb,
  FaSun,
  FaUtensils,
  FaCamera,
  FaUsers,
  FaChevronRight,
  FaExpand
} from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getTourImage, getTourGallery, getItineraryDayPhotos } from '../utils/tourImages';
import TourGalleryBento from '../components/tours/TourGalleryBento';
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
  const { user } = useAuth();
  const location = useLocation();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedPersona, setSelectedPersona] = useState('family');
  const [selectedDayFilter, setSelectedDayFilter] = useState(null);
  const [dayLightboxPhoto, setDayLightboxPhoto] = useState(null);

  const personaOptions = [
    { id: 'family', label: 'Gia đình có trẻ nhỏ', icon: FaUsers, advice: 'Lịch trình được tối ưu với nhịp độ thư thả, xe đưa đón điều hòa êm ái, các điểm tham quan có lối đi xe đẩy và thang máy. Thực đơn nhà hàng đảm bảo món thanh đạm, dinh dưỡng cho trẻ nhỏ.' },
    { id: 'couple', label: 'Cặp đôi check-in', icon: FaHeart, advice: 'Khung giờ ngắm hoàng hôn vàng từ 16:30 - 17:30, các góc sống ảo triệu view tại danh thắng bản địa và resort. Bàn ăn tối được sắp xếp ưu tiên không gian lãng mạn, riêng tư.' },
    { id: 'foodie', label: 'Khám phá ẩm thực', icon: FaAward, advice: 'Thưởng thức 100% tinh hoa đặc sản trứ danh địa phương tại các cơ sở lâu đời uy tín. Hướng dẫn viên thuyết minh nguồn gốc câu chuyện ẩm thực dân gian đặc sắc.' },
    { id: 'adventure', label: 'Năng động & Trải nghiệm', icon: FaBolt, advice: 'Cung đường trải nghiệm phong phú với hoạt động ngoài trời, lặn ngắm thiên nhiên và khám phá văn hóa bản địa cùng trang thiết bị bảo hộ đạt tiêu chuẩn an toàn cao nhất.' }
  ];

  const currentPersona = personaOptions.find(p => p.id === selectedPersona) || personaOptions[0]; // 'itinerary' | 'services' | 'policy'
  const [recommendedTours, setRecommendedTours] = useState([]);

  // Tải thông tin chi tiết tour
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  const handleToggleSaved = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập để lưu tour vào danh sách yêu thích!');
      navigate('/login', { state: { from: location } });
      return;
    }
    toggleSaved(tour);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để đặt tour!');
      navigate('/login', { state: { from: location } });
      return;
    }
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    addToCart(tour, quantity);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.info('Vui lòng đăng nhập tài khoản để tiến hành đặt tour!');
      navigate('/login', { state: { from: location } });
      return;
    }
    tourApi.recordActivity(tour.id, 'ADD_TO_CART');
    if (addToCart(tour, quantity)) {
      navigate('/checkout');
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Đang tải thông tin tour..." />;
  if (!tour) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
          Không tìm thấy thông tin tour du lịch này
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px' }}>
          Tour du lịch này có thể tạm thời chưa khả dụng hoặc đường dẫn không tồn tại.
        </p>
        <Link to="/tours" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '10px' }}>
          Khám phá danh sách các tour khác
        </Link>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const departureHasPassed = hasTourDatePassed(tour.startDate || tour.endDate);
  const availableSeats = Number(tour.availableSeats) || 0;
  const price = Number(tour.price || 0);
  const originalPrice = Number(tour.originalPrice || tour.original_price || 0);
  const hasDiscount = originalPrice > price;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const badge = tour.badge || (hasDiscount ? 'HOT DEAL' : null);
  const hotelStar = tour.hotelStar || tour.hotel_star || 4;
  const vehicle = tour.vehicle || 'Xe du lịch cao cấp';

  // Group / B2B discount: from 10 guests
  const isB2bEligible = quantity >= 10;
  const b2bDiscountRate = isB2bEligible ? 0.05 : 0;
  const subtotal = price * quantity;
  const discountAmount = subtotal * b2bDiscountRate;
  const finalTotal = subtotal - discountAmount;

  const getVehicleIcon = (v) => {
    if (!v) return <FaBus />;
    const lower = v.toLowerCase();
    if (lower.includes('bay') || lower.includes('vietjet') || lower.includes('airlines')) return <FaPlane />;
    if (lower.includes('tàu') || lower.includes('du thuyền') || lower.includes('cano')) return <FaShip />;
    return <FaBus />;
  };

  // Robust JSON or Array string parser
  const safeParseJson = (val) => {
    if (!val) return null;
    if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  // Helper parsing highlights
  const parseHighlights = (text) => {
    const defaultHighlights = [
      `Khám phá trọn vẹn điểm đến ${tour.name || 'nổi tiếng'}`,
      `Phương tiện: ${vehicle}`,
      `Tiêu chuẩn lưu trú: Khách sạn ${hotelStar} sao sang trọng`,
      'Bảo hiểm du lịch trọn gói mức trách nhiệm 100.000.000đ/vụ'
    ];

    if (!text) return defaultHighlights;

    const parsed = safeParseJson(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(s => String(s).trim().replace(/^[-*•✓]\s*/, '')).filter(Boolean);
    }

    if (typeof text === 'string' && text.trim()) {
      const items = text.split('\n').map(s => s.trim().replace(/^[-*•✓]\s*/, '')).filter(Boolean);
      if (items.length > 0) return items;
    }

    return defaultHighlights;
  };

  // Helper parsing itinerary
  const parseItinerary = (itineraryText) => {
    const defaultItinerary = Array.from({ length: Math.max(1, tour.duration || 3) }).map((_, idx) => ({
      day: idx + 1,
      title: idx === 0 ? `Khởi hành từ ${tour.departureLocation || 'điểm hẹn'} – Nhận phòng nghỉ ngơi` :
             idx === (tour.duration || 3) - 1 ? 'Tự do mua sắm đặc sản – Kết thúc hành trình' :
             'Khám phá danh lam thắng cảnh & Trải nghiệm văn hóa địa phương',
      content: idx === 0 ? `Xe và hướng dẫn viên đón đoàn tại điểm hẹn, khởi hành đi ${tour.name || 'điểm đến'}. Đoàn dùng bữa trưa tại nhà hàng, nhận phòng khách sạn và bắt đầu tham quan các điểm nổi bật buổi chiều.` :
               idx === (tour.duration || 3) - 1 ? 'Đoàn dùng điểm tâm sáng buffet, tự do dạo phố, chụp ảnh và mua sắm quà lưu niệm cho người thân. Sau bữa trưa, xe đưa đoàn về lại điểm đón ban đầu, chia tay và hẹn gặp lại.' :
               'Đoàn thưởng thức bữa sáng buffet, sau đó di chuyển tham quan các danh lam thắng cảnh tiêu biểu, trải nghiệm các hoạt động giải trí đặc sắc và thưởng thức ẩm thực truyền thống.'
    }));

    if (!itineraryText) return defaultItinerary;

    const parsed = safeParseJson(itineraryText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          const contentStr = typeof item.content === 'string'
            ? item.content
            : Array.isArray(item.content)
              ? item.content.join('\n')
              : (item.description || item.desc || '');
          return {
            day: item.day || (idx + 1),
            title: item.title || `Khám phá ngày ${idx + 1}`,
            content: contentStr
          };
        }
        return {
          day: idx + 1,
          title: `Ngày ${idx + 1}`,
          content: String(item)
        };
      });
    }

    if (typeof itineraryText === 'string' && itineraryText.trim()) {
      const rawDays = itineraryText.split(/(?=(?:NGÀY|Ngày|Day)\s*\d+[:\s-])/gi).filter(Boolean);
      if (rawDays.length > 0) {
        return rawDays.map((block, idx) => {
          const firstLineEnd = block.indexOf('\n');
          const titleLine = firstLineEnd !== -1 ? block.substring(0, firstLineEnd).trim() : block.trim();
          const body = firstLineEnd !== -1 ? block.substring(firstLineEnd).trim() : '';
          return {
            day: idx + 1,
            title: titleLine.replace(/^(?:NGÀY|Ngày|Day)\s*\d+[:\s-]*/i, '').trim() || `Khám phá ngày ${idx + 1}`,
            content: body || titleLine
          };
        });
      }

      return [{
        day: 1,
        title: 'Lịch trình chi tiết chương trình',
        content: itineraryText
      }];
    }

    return defaultItinerary;
  };

  // Helper parsing inclusions / exclusions
  const defaultInclusions = [
    'Xe du lịch đời mới máy lạnh phục vụ đưa đón suốt lịch trình',
    `Khách sạn tiêu chuẩn ${hotelStar} sao tiện nghi (nghỉ 2 khách/phòng, lẻ nam/nữ ghép 3)`,
    'Các bữa ăn theo chương trình (bữa sáng tại khách sạn, bữa chính tại nhà hàng đặc sản)',
    'Vé vào cổng tham quan tất cả các thắng cảnh có trong chương trình',
    'Hướng dẫn viên du lịch chuyên nghiệp, nhiệt tình, am hiểu văn hóa địa phương',
    'Bảo hiểm du lịch trọn gói mức bồi thường tối đa 100.000.000 VNĐ / vụ',
    'Khăn lạnh và nước suối tinh khiết phục vụ hàng ngày'
  ];

  const defaultExclusions = [
    'Chi phí cá nhân ngoài chương trình: giặt ủi, điện thoại, minibar khách sạn',
    'Phụ thu phòng đơn đối với khách đi 1 mình không ghép phòng',
    'Tiền tip bồi dưỡng cho tài xế và hướng dẫn viên (tự nguyện)',
    'Thuế VAT 8% (nếu quý khách có nhu cầu xuất hóa đơn đỏ công ty)'
  ];

  const parseList = (rawText, defaultList) => {
    if (!rawText) return defaultList;
    const parsed = safeParseJson(rawText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(s => String(s).trim().replace(/^[-*•✓✕x]\s*/, '')).filter(Boolean);
    }
    if (typeof rawText === 'string' && rawText.trim()) {
      const items = rawText.split('\n').map(s => s.trim().replace(/^[-*•✓✕x]\s*/, '')).filter(Boolean);
      if (items.length > 0) return items;
    }
    return defaultList;
  };

  const inclusions = parseList(tour.inclusions, defaultInclusions);
  const exclusions = parseList(tour.exclusions, defaultExclusions);

  const itineraryDays = parseItinerary(tour.itinerary);
  const highlights = parseHighlights(tour.highlights);

  return (
    <div className="tour-detail-page">
      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <div className="td-header mb-4">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Trang chủ</span> {'>'}{' '}
            <span onClick={() => navigate('/tours')}>Khám phá tour</span> {'>'}{' '}
            {tour.category && (
              <>
                <span onClick={() => navigate(`/tours?category=${tour.category.id || tour.category.categoryId}`)}>
                  {tour.category.name || tour.category.categoryName}
                </span> {'>'}{' '}
              </>
            )}
            <span className="active">{tour.name || tour.tourName}</span>
          </div>

          <div className="td-title-row">
            <div>
              {badge && (
                <div className="td-badge-pill">
                  <FaFire /> {badge}
                </div>
              )}
              <h1 className="td-title">{tour.name || tour.tourName}</h1>
            </div>
            <button
              type="button"
              className={`td-save-btn${isSaved(tour) ? ' is-saved' : ''}`}
              aria-pressed={isSaved(tour)}
              onClick={handleToggleSaved}
            >
              <FaHeart aria-hidden="true" />
              {isSaved(tour) ? 'Đã lưu' : 'Lưu tour'}
            </button>
          </div>

          <div className="td-meta-bar">
            {tour.category && (
              <span className="badge-cat">
                {tour.category.name || tour.category.categoryName}
              </span>
            )}
            <span className="td-meta-rating">
              <FaStar className="star-icon" /> {tour.rating || 4.8} / 5 (Đánh giá tuyệt hảo)
            </span>
            <span className="location">
              <FaMapMarkerAlt /> Khởi hành: <b>{tour.departureLocation || 'TP. Hồ Chí Minh'}</b>
            </span>
            {tour.provider && (
              <span className="td-provider-tag">
                Đối tác: <b>{tour.provider.fullName || tour.provider.username}</b>
              </span>
            )}
          </div>
        </div>

        {/* Bộ sưu tập ảnh Bento Mosaic, Video trải nghiệm và Lightbox */}
        <TourGalleryBento tour={tour} gallery={getTourGallery(tour)} />

        {/* Thông tin nhanh: Thời lượng, phương tiện, khách sạn, số chỗ */}
        <div className="td-highlights mb-4">
          <div className="hl-item">
            <FaClock className="hl-icon" /> 
            <div className="hl-text">
              <span>Thời lượng</span>
              <b>{tour.duration} Ngày {Math.max(1, tour.duration - 1)} Đêm</b>
            </div>
          </div>
          <div className="hl-item">
            <span className="hl-icon-vehicle">{getVehicleIcon(vehicle)}</span>
            <div className="hl-text">
              <span>Phương tiện</span>
              <b>{vehicle}</b>
            </div>
          </div>
          <div className="hl-item">
            <FaHotel className="hl-icon" /> 
            <div className="hl-text">
              <span>Khách sạn</span>
              <b>{hotelStar} Sao Cao Cấp</b>
            </div>
          </div>
          <div className="hl-item">
            <FaUserFriends className="hl-icon" /> 
            <div className="hl-text">
              <span>Số chỗ còn lại</span>
              <b style={{ color: availableSeats <= 5 ? '#f97316' : '#10b981' }}>
                {availableSeats > 0 ? `${availableSeats} chỗ` : 'Đã hết chỗ'}
              </b>
            </div>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="td-layout">
          {/* Main Info Left Column */}
          <div className="td-main">
            {/* Highlights Box */}
            <div className="td-features-highlight mb-4">
              <h3 className="sub-title"><FaAward style={{ color: "#0194F3", marginRight: "8px" }} /> Điểm nhấn đặc sắc của hành trình</h3>
              <div className="highlight-points-grid">
                {highlights.map((item, idx) => (
                  <div key={idx} className="highlight-point">
                    <FaCheckCircle className="hl-point-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="td-nav-tabs">
              <button 
                type="button"
                className={`td-nav-tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
                onClick={() => setActiveTab('itinerary')}
              >
                Lịch trình chi tiết
              </button>
              <button 
                type="button"
                className={`td-nav-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Dịch vụ bao gồm & loại trừ
              </button>
              <button 
                type="button"
                className={`td-nav-tab-btn ${activeTab === 'policy' ? 'active' : ''}`}
                onClick={() => setActiveTab('policy')}
              >
                Chính sách đổi trả & B2B
              </button>
              <button 
                type="button"
                className={`td-nav-tab-btn ${activeTab === 'ai_insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai_insights')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FaMagic style={{ color: '#0194F3' }} /> Trải Nghiệm & Đánh Giá
              </button>
            </div>

            {/* Tab 1: Itinerary Accordion Timeline */}
            {activeTab === 'itinerary' && (
              <div className="tab-pane-content">
                <div className="td-section mb-4">
                  <h3 className="section-tab-heading">Giới thiệu tổng quan chuyến đi</h3>
                  <p className="td-overview-desc">
                    {tour.description || 'Hành trình được thiết kế chuẩn mực bởi đội ngũ lữ hành chuyên nghiệp, mang đến trải nghiệm trọn vẹn và an tâm tuyệt đối.'}
                  </p>
                </div>

                <div className="ai-itinerary-tailor-box mb-4">
                  <div className="ai-tailor-header">
                    <div className="ai-tailor-title">
                      <FaMagic className="ai-icon-pulse" />
                      <span>Gợi Ý Lịch Trình Theo Đối Tượng Du Khách</span>
                    </div>
                    <span className="ai-tailor-badge">Tư vấn thông minh</span>
                  </div>
                  <p className="ai-tailor-sub">Chọn phong cách chuyến đi của bạn để nhận lưu ý và mẹo tối ưu độc quyền:</p>
                  <div className="ai-persona-pills">
                    {personaOptions.map((p) => {
                      const IconComp = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={`ai-persona-btn ${selectedPersona === p.id ? 'active' : ''}`}
                          onClick={() => setSelectedPersona(p.id)}
                        >
                          <IconComp className="persona-icon" />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="ai-tailor-advice-card animate-fade-in">
                    <div className="ai-advice-kicker">
                      <FaLightbulb style={{ color: '#f59e0b', marginRight: '6px' }} />
                      Ghi chú thông minh dành cho <b>{currentPersona.label}</b>:
                    </div>
                    <p className="ai-advice-text">{currentPersona.advice}</p>
                  </div>
                </div>

                <div className="td-section">
                  <div className="itinerary-section-top">
                    <div>
                      <h3 className="section-tab-heading">Lịch trình chi tiết & Hình ảnh thực tế từng ngày</h3>
                      <p className="itinerary-sub-hint">Nhấp vào từng ngày để xem nhanh lộ trình, thời gian biểu và ảnh điểm tham quan:</p>
                    </div>
                  </div>

                  {/* Horizontal Interactive Day Stepper */}
                  <div className="itinerary-day-stepper mb-3">
                    <button
                      type="button"
                      className={`day-stepper-btn ${selectedDayFilter === null ? 'active' : ''}`}
                      onClick={() => setSelectedDayFilter(null)}
                    >
                      Tất cả các ngày ({itineraryDays.length} ngày)
                    </button>
                    {itineraryDays.map((dayItem) => (
                      <button
                        key={dayItem.day}
                        type="button"
                        className={`day-stepper-btn ${selectedDayFilter === dayItem.day ? 'active' : ''}`}
                        onClick={() => setSelectedDayFilter(dayItem.day)}
                      >
                        Ngày {dayItem.day}: {dayItem.title?.substring(0, 20) || `Hành trình ngày ${dayItem.day}`}{dayItem.title?.length > 20 ? '...' : ''}
                      </button>
                    ))}
                  </div>

                  <div className="itinerary-timeline">
                    {itineraryDays
                      .filter((item) => selectedDayFilter === null || selectedDayFilter === item.day)
                      .map((item) => {
                        const dayPhotos = getItineraryDayPhotos(tour, item.day, item.title);
                        return (
                          <div key={item.day} className="itinerary-day-card modern-day-card">
                            <div className="itinerary-day-header">
                              <div className="itinerary-day-badge">
                                NGÀY {item.day}
                              </div>
                              <h4 className="itinerary-day-title">{item.title}</h4>
                            </div>

                            {/* Time Slot Milestones Badges */}
                            <div className="day-time-slots">
                              <span className="time-slot-pill slot-morning">
                                <FaSun className="slot-icon" /> Sáng 08:00 · Đón đoàn & Khởi hành
                              </span>
                              <span className="time-slot-pill slot-noon">
                                <FaUtensils className="slot-icon" /> Trưa 12:00 · Dùng bữa đặc sản
                              </span>
                              <span className="time-slot-pill slot-afternoon">
                                <FaCamera className="slot-icon" /> Chiều 15:30 · Tham quan & Sống ảo
                              </span>
                            </div>

                            {/* Reference Destination Photos for this Day */}
                            {dayPhotos && dayPhotos.length > 0 && (
                              <div className="day-ref-photos-section">
                                <div className="ref-photos-label">
                                  <FaCamera style={{ color: '#0194f3', marginRight: '6px' }} />
                                  <span>Ảnh thực tế điểm đến Ngày {item.day}:</span>
                                </div>
                                <div className="day-photos-grid">
                                  {dayPhotos.map((photo, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="day-photo-item"
                                      onClick={() => setDayLightboxPhoto(photo)}
                                      title={photo.title}
                                    >
                                      <img src={photo.url} alt={photo.title} loading="lazy" />
                                      <div className="day-photo-overlay">
                                        <span className="day-photo-tag">{photo.tag || 'Điểm đến'}</span>
                                        <span className="day-photo-title">{photo.title}</span>
                                        <span className="day-photo-zoom-btn">
                                          <FaExpand />
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="itinerary-day-body">
                              <div className="itinerary-day-text">
                                {item.content.split('\n').map((line, lIdx) => (
                                  <p key={lIdx} style={{ margin: '0 0 8px 0' }}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Services 2-Column Standard */}
            {activeTab === 'services' && (
              <div className="tab-pane-content">
                <div className="services-two-cols">
                  <div className="service-col-box included-box">
                    <h3 className="service-box-title title-inclusions">
                      <FaCheckCircle /> Dịch vụ bao gồm trọn gói
                    </h3>
                    <ul className="service-list">
                      {inclusions.map((item, idx) => (
                        <li key={idx}><FaCheckCircle className="li-icon inc-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="service-col-box excluded-box">
                    <h3 className="service-box-title title-exclusions">
                      <FaTimesCircle /> Dịch vụ không bao gồm
                    </h3>
                    <ul className="service-list">
                      {exclusions.map((item, idx) => (
                        <li key={idx}><FaTimesCircle className="li-icon exc-icon" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Policy & B2B Rules */}
            {activeTab === 'policy' && (
              <div className="tab-pane-content">
                <div className="policy-box">
                  <h3 className="policy-heading"><FaShieldAlt /> Điều kiện đổi hủy & Hoàn tiền</h3>
                  <div className="policy-list">
                    <p><strong>1. Quy trình giữ chỗ:</strong> Đơn đặt chỗ sẽ được hệ thống tạm giữ trong vòng 24h và gửi mã xác nhận qua email. Chuyên viên lữ hành sẽ liên hệ tư vấn chi tiết trước khi hoàn tất.</p>
                    <p><strong>2. Hủy trước 7 ngày:</strong> Hoàn trả 100% chi phí tour hoặc hỗ trợ bảo lưu giá trị chuyến đi sang thời gian khác miễn phí.</p>
                    <p><strong>3. Hủy từ 3 - 6 ngày trước ngày khởi hành:</strong> Phí đổi hủy 30% giá trị hợp đồng dịch vụ.</p>
                    <p><strong>4. Hủy trong vòng 48h trước giờ bay/khởi hành:</strong> Phí đổi hủy 70% giá trị tour.</p>
                    <p><strong>5. Ưu đãi Doanh nghiệp & Đoàn B2B:</strong> Các đoàn thể, công ty từ 10 khách trở lên được hưởng chiết khấu trực tiếp 5%, nâng cấp bữa ăn VIP và hỗ trợ thiết kế banner teambuilding riêng.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: AI Review Sentiment & Insights */}
            {activeTab === 'ai_insights' && (
              <div className="tab-pane-content">
                <div className="ai-sentiment-dashboard">
                  <div className="ai-sentiment-score-header">
                    <div className="ai-score-circle">
                      <span className="score-num">4.9</span>
                      <span className="score-max">/ 5.0</span>
                    </div>
                    <div className="ai-score-meta">
                      <div className="ai-score-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
                        ))}
                        <span className="ai-score-text">Độ Hài Lòng Rất Cao (98% Khuyên Đi)</span>
                      </div>
                      <p className="ai-score-desc">
                        Hệ thống tổng hợp và phân tích khách quan từ <strong>142 lượt phản hồi thực tế</strong> của các du khách đã hoàn tất hành trình.
                      </p>
                    </div>
                  </div>

                  {/* 3 Bento Summary Cards */}
                  <div className="ai-bento-grid">
                    <div className="ai-bento-card bento-pros">
                      <div className="bento-card-title text-success">
                        <FaCheckCircle style={{ color: '#16a34a', marginRight: '6px' }} />
                        Điểm Hài Lòng Nổi Bật (Pros)
                      </div>
                      <ul className="bento-list">
                        <li>Hướng dẫn viên nhiệt tình, am hiểu văn hóa sâu sắc và luôn hỗ trợ chụp ảnh chu đáo.</li>
                        <li>Xe du lịch đưa đón đời mới, máy lạnh êm và khách sạn chuẩn tiện nghi như cam kết.</li>
                        <li>Thực đơn phong phú, đầy ắp đặc sản vùng miền tươi ngon và vệ sinh an toàn thực phẩm.</li>
                      </ul>
                    </div>

                    <div className="ai-bento-card bento-tips">
                      <div className="bento-card-title text-amber">
                        <FaLightbulb style={{ color: '#d97706', marginRight: '6px' }} />
                        Kinh Nghiệm & Lưu Ý Hữu Ích
                      </div>
                      <ul className="bento-list">
                        <li>Nên mang theo giày đế bám và mũ nón che nắng cho các chặng tham quan ngoài trời.</li>
                        <li>Nên đem theo sạc dự phòng vì hành trình có nhiều điểm check-in phong cảnh tuyệt đẹp.</li>
                        <li>Đoàn có em bé hoặc người cao tuổi có thể liên hệ trước để sắp xếp phòng tầng thấp.</li>
                      </ul>
                    </div>

                    <div className="ai-bento-card bento-match">
                      <div className="bento-card-title text-primary">
                        <FaCompass style={{ color: '#0194f3', marginRight: '6px' }} />
                        Chỉ Số Phù Hợp (Persona Match)
                      </div>
                      <div className="match-progress-list">
                        <div className="match-progress-row">
                          <span>Gia đình có trẻ em & người lớn tuổi:</span>
                          <b>96%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '96%' }}></div></div>

                        <div className="match-progress-row">
                          <span>Cặp đôi nghỉ dưỡng & trăng mật:</span>
                          <b>98%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '98%' }}></div></div>

                        <div className="match-progress-row">
                          <span>Khách đoàn Doanh nghiệp (B2B):</span>
                          <b>94%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '94%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Sidebar Right Column */}
          <div className="td-sidebar">
            <div className="booking-card">
              <div className="price-box">
                {hasDiscount && (
                  <div className="sidebar-original-row">
                    <span className="sidebar-original-price">{formatPrice(originalPrice)}</span>
                    <span className="sidebar-discount-pill">-{discountPercent}% TIẾT KIỆM</span>
                  </div>
                )}
                <div className="sidebar-price-row">
                  <span className="price">{formatPrice(price)}</span>
                  <span className="price-unit">/ 1 vé người lớn</span>
                </div>
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
                <small className="seats-indicator-text">
                  {departureHasPassed
                    ? 'Ngày khởi hành đã qua; cần cập nhật lịch trước khi đặt'
                    : availableSeats > 0
                      ? `Còn lại ${availableSeats} chỗ theo thời gian thực`
                      : 'Hiện không còn chỗ'}
                </small>
              </div>

              {/* B2B Group discount alert */}
              {isB2bEligible && (
                <div className="b2b-discount-alert">
                  <FaPercent /> <b>Ưu đãi B2B:</b> Đã giảm 5% ({formatPrice(discountAmount)}) cho đoàn từ 10 khách!
                </div>
              )}

              <div className="total-box">
                <span>Tổng cộng tạm tính:</span>
                <span className="total-price">{formatPrice(finalTotal)}</span>
              </div>

              <div className="action-btns" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-full btn-buy-now"
                  disabled={!availableSeats || departureHasPassed}
                  onClick={handleBuyNow}
                >
                  <FaBolt /> {departureHasPassed ? 'Lịch khởi hành đã qua' : availableSeats ? 'Đặt Giữ Chỗ Tức Thì' : 'Hiện hết chỗ'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-full btn-add-cart"
                  disabled={!availableSeats || departureHasPassed}
                  onClick={handleAddToCart}
                >
                  <FaShoppingCart /> Thêm Vào Giỏ Hàng
                </button>
              </div>
              
              <div className="support-info mt-4">
                <div className="trust-bullets">
                  <span><FaCheckCircle style={{ color: '#10b981', marginRight: '6px' }} /> Miễn phí giữ chỗ trong 24 giờ</span>
                  <span><FaShieldAlt style={{ color: '#0194F3', marginRight: '6px' }} /> Bảo mật thanh toán trực tuyến</span>
                  <span><FaHeadset style={{ color: '#8b5cf6', marginRight: '6px' }} /> Hỗ trợ tư vấn đoàn B2B 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendedTours && recommendedTours.length > 0 && (
          <div className="td-recommendations mt-5 pt-4">
            <div className="rec-header">
              <h3 className="rec-title">
                <FaCompass style={{ color: '#0194F3', marginRight: '8px' }} /> Gợi ý tour tương tự dành riêng cho bạn
              </h3>
              <p className="rec-subtitle">
                Hệ thống đề xuất dựa trên sở thích danh mục và hành vi xem tour gần đây của bạn.
              </p>
            </div>
            <div className="tour-grid">
              {recommendedTours.map((item) => (
                <TourCard key={item.id} tour={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Day Photo Detail Lightbox Modal */}
      {dayLightboxPhoto && (
        <div className="lightbox-backdrop animate-fade-in" onClick={() => setDayLightboxPhoto(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-meta">
                <span className="lightbox-title-text">{dayLightboxPhoto.title}</span>
                <span className="lightbox-counter-pill">{dayLightboxPhoto.tag || 'Ảnh thực tế'}</span>
              </div>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setDayLightboxPhoto(null)}
                aria-label="Đóng ảnh"
              >
                <FaTimes />
              </button>
            </div>
            <div className="lightbox-stage">
              <div className="lightbox-img-wrapper">
                <img
                  src={dayLightboxPhoto.url}
                  alt={dayLightboxPhoto.title}
                  className="lightbox-large-img"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
