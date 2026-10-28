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
  FaExpand,
  FaThumbsUp,
  FaPen,
  FaChild,
  FaCalendarCheck,
  FaBuilding,
  FaPhoneAlt,
  FaExternalLinkAlt,
  FaTimes
} from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getTourImage, getTourGallery, getItineraryDayPhotos } from '../utils/tourImages';
import { getProviderInfo } from '../utils/providerData';
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

  // Dynamic Departure Date Selection
  const [selectedDepartureDate, setSelectedDepartureDate] = useState(null);

  // Reviews List and Interactive Review Form
  const [reviewFilter, setReviewFilter] = useState('Tất cả');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewType, setNewReviewType] = useState('Gia đình');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const initialReviews = [
    {
      id: 1,
      author: 'Nguyễn Hoàng Nam',
      avatarText: 'HN',
      avatarBg: '#0194F3',
      tripType: 'Cặp đôi',
      rating: 5,
      date: '14/10/2026',
      comment: 'Chuyến đi trên cả tuyệt vời! Hướng dẫn viên cực kỳ nhiệt tình, vui tính và chụp ảnh siêu có tâm. Khách sạn chuẩn tiện nghi, bữa sáng buffet rất phong phú nhiều món ngon. Xe đưa đón Universe êm ái không hề bị say xe. Nhất định sẽ quay lại đồng hành cùng Du Lịch Việt!',
      photos: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400'
      ],
      cskhReply: {
        date: '15/10/2026',
        text: 'Dạ Du Lịch Việt xin chân thành cảm ơn anh Hoàng Nam và bạn đồng hành đã tin tưởng lựa chọn dịch vụ của công ty! Kính chúc anh luôn dồi dào sức khỏe, niềm vui và hẹn gặp lại anh trong những chuyến đi sắp tới ạ!'
      },
      helpfulCount: 34
    },
    {
      id: 2,
      author: 'Chị Phan Thu Trang (Gia đình)',
      avatarText: 'TT',
      avatarBg: '#10b981',
      tripType: 'Gia đình',
      rating: 5,
      date: '08/10/2026',
      comment: 'Nhà mình đi 4 người gồm 2 người lớn và 2 bé nhỏ. Điểm cộng lớn nhất là lịch trình sắp xếp cực kỳ hợp lý, không bị vội hay mệt mỏi. Các bữa ăn đầy đặn đặc sản vùng miền sạch sẽ. Khách sạn hỗ trợ nhận phòng sớm và có khu vui chơi cho các bé. Rất ưng ý!',
      photos: [
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=400'
      ],
      cskhReply: {
        date: '09/10/2026',
        text: 'Dạ Du Lịch Việt rất vinh hạnh được phục vụ gia đình chị Trang. Sự hài lòng và nụ cười của hai bé chính là động lực to lớn nhất của toàn thể đội ngũ ạ!'
      },
      helpfulCount: 28
    },
    {
      id: 3,
      author: 'Anh Trần Quốc Bảo (Đoàn FPT Telecom)',
      avatarText: 'QB',
      avatarBg: '#8b5cf6',
      tripType: 'Khách đoàn B2B',
      rating: 5,
      date: '28/09/2026',
      comment: 'Công ty mình đặt đoàn 36 người đi nghỉ dưỡng kết hợp Gala Dinner. Phải khen ngợi khâu tổ chức rất chuyên nghiệp: xe đưa đón đúng giờ, banner backdrop thiết kế riêng đẹp mắt, MC hoạt náo tràn đầy năng lượng. Chiết khấu B2B 5% và xuất hóa đơn điện tử VAT rất nhanh gọn!',
      cskhReply: {
        date: '29/09/2026',
        text: 'Du Lịch Việt trân trọng cảm ơn Ban lãnh đạo và toàn thể CBNV quý công ty FPT Telecom đã gửi trọn niềm tin. Rất mong được tiếp tục đồng hành trong kỳ nghỉ hè năm sau!'
      },
      helpfulCount: 42
    },
    {
      id: 4,
      author: 'Đặng Tuấn Anh',
      avatarText: 'TA',
      avatarBg: '#f59e0b',
      tripType: 'Nhóm bạn',
      rating: 4,
      date: '19/09/2026',
      comment: 'Cảnh quan tuyệt đẹp, thời tiết ủng hộ nên ảnh chụp nhóm lung linh luôn. Đồ ăn tươi ngon, đặc biệt là tiệc nướng hải sản. Điểm trừ nhỏ là ngày thứ 2 di chuyển hơi nhiều bậc thang nên cần mang giày bám tốt. Đánh giá tổng quan 9.5/10 điểm!',
      photos: [
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=400',
        'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=400'
      ],
      cskhReply: {
        date: '20/09/2026',
        text: 'Cảm ơn góp ý rất thiết thực của anh Tuấn Anh! Du Lịch Việt đã ghi nhận để hướng dẫn viên tư vấn kỹ hơn về trang phục trekking cho các đoàn tiếp theo ạ.'
      },
      helpfulCount: 19
    },
    {
      id: 5,
      author: 'Bác Vũ Minh Khang',
      avatarText: 'MK',
      avatarBg: '#0284c7',
      tripType: 'Nghỉ dưỡng',
      rating: 5,
      date: '05/09/2026',
      comment: 'Bác đi cùng hội bạn hưu trí, ban đầu cũng lo sức khỏe không theo kịp nhưng hướng dẫn viên rất chu đáo, luôn đi chậm chờ mọi người và hỗ trợ xách hành lý. Khách sạn có thang máy êm ái, phòng sạch sẽ thoáng mát. Rất cảm ơn công ty!',
      cskhReply: {
        date: '06/09/2026',
        text: 'Kính chúc bác Khang và các bác trong hội luôn dồi dào sức khỏe và an vui bên gia đình!'
      },
      helpfulCount: 26
    }
  ];

  const [reviewsList, setReviewsList] = useState(initialReviews);

  // Generate 4 dynamic upcoming departure dates
  const generateUpcomingDepartures = () => {
    const dates = [];
    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const basePrice = Number(tour?.price || 4890000);
    const now = new Date();
    
    for (let i = 1; i <= 4; i++) {
      const d = new Date(now.getTime() + (i * 7 + 2) * 24 * 60 * 60 * 1000);
      const dow = daysOfWeek[d.getDay()];
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      const seats = i === 1 ? 6 : (12 + (i * 4));
      const p = i === 2 ? Math.round(basePrice * 0.95) : basePrice;

      dates.push({
        dayOfWeek: dow,
        dateStr: dateStr,
        seats: seats,
        price: p
      });
    }
    return dates;
  };

  const departureDatesList = tour ? generateUpcomingDepartures() : [];

  const handleCustomReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      toast.warning('Vui lòng điền đầy đủ họ tên và nội dung đánh giá!');
      return;
    }

    const newRev = {
      id: Date.now(),
      author: newReviewName.trim(),
      avatarText: newReviewName.trim().substring(0, 2).toUpperCase(),
      avatarBg: '#0194f3',
      tripType: newReviewType,
      rating: newReviewRating,
      date: 'Hôm nay',
      comment: newReviewComment.trim(),
      helpfulCount: 1,
      cskhReply: {
        date: 'Vừa xong',
        text: 'Dạ Du Lịch Việt xin chân thành cảm ơn đánh giá quý báu của anh/chị! Ý kiến đóng góp sẽ giúp nâng cao chất lượng dịch vụ ngày một hoàn thiện hơn.'
      }
    };

    setReviewsList([newRev, ...reviewsList]);
    setNewReviewName('');
    setNewReviewComment('');
    setShowReviewForm(false);
    toast.success('Gửi đánh giá thành công! Cảm ơn nhận xét của bạn.');
  };

  const handleHelpfulVote = (reviewId) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || (reviewsList.find(r => r.id === reviewId)?.helpfulCount || 10)) + 1
    }));
    toast.success('Cảm ơn bạn đã bình chọn đánh giá hữu ích!');
  };

  const filteredReviews = reviewsList.filter(r => {
    if (reviewFilter === 'Tất cả') return true;
    if (reviewFilter === 'Có hình ảnh') return r.photos && r.photos.length > 0;
    if (reviewFilter === '5 Sao') return r.rating === 5;
    if (reviewFilter === '4 Sao') return r.rating === 4;
    if (reviewFilter === 'Gia đình') return r.tripType === 'Gia đình';
    if (reviewFilter === 'Cặp đôi') return r.tripType === 'Cặp đôi';
    if (reviewFilter === 'Khách đoàn B2B') return r.tripType === 'Khách đoàn B2B';
    return true;
  });

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
  const providerInfo = getProviderInfo(tour.providerId || tour.provider?.id || tour.provider_id, tour.providerName || tour.provider?.fullName || tour.provider?.username);

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
            <span className="td-provider-tag" style={{ borderColor: `${providerInfo.brandColor}40`, color: providerInfo.brandColor, background: `${providerInfo.brandColor}0d` }}>
              <FaBuilding style={{ marginRight: '5px' }} />
              Đơn vị tổ chức: <b>{providerInfo.shortName}</b>
              <FaCheckCircle style={{ color: '#059669', marginLeft: '5px' }} title="Đối tác lữ hành chính thức được kiểm duyệt bởi Du Lịch Việt" />
            </span>
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

            {/* THẺ ĐƠN VỊ TỔ CHỨC & ĐIỀU HÀNH TOUR (Multi-Vendor Partner Card) */}
            <div className="tour-organizer-card mb-4">
              <div className="organizer-header">
                <div className="organizer-brand-box" style={{ borderColor: `${providerInfo.brandColor}33` }}>
                  <div className="organizer-logo-avatar" style={{ backgroundColor: providerInfo.brandColor }}>
                    <FaBuilding className="organizer-icon" />
                  </div>
                  <div className="organizer-info">
                    <div className="organizer-top-row">
                      <span className="organizer-kicker">Đơn vị tổ chức & điều hành tour</span>
                      <span className="organizer-verified-badge">
                        <FaCheckCircle className="check-icon" /> Đã xác thực OTA
                      </span>
                    </div>
                    <h4 className="organizer-name">{providerInfo.name}</h4>
                    <div className="organizer-meta-chips">
                      <span className="organizer-chip chip-badge">{providerInfo.badgeText}</span>
                      <span className="organizer-chip chip-rating">
                        <FaStar className="star-sm" /> <b>{providerInfo.rating}</b> ({providerInfo.reviewCount.toLocaleString()} đánh giá)
                      </span>
                      <span className="organizer-chip chip-exp">Kinh nghiệm từ {providerInfo.establishedYear}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="organizer-body">
                <p className="organizer-desc">{providerInfo.description}</p>
                <div className="organizer-credentials-grid">
                  <div className="cred-item">
                    <FaAward className="cred-icon" />
                    <div>
                      <span className="cred-label">Giấy phép Lữ Hành Quốc Tế</span>
                      <b className="cred-val">{providerInfo.license}</b>
                    </div>
                  </div>
                  <div className="cred-item">
                    <FaPhoneAlt className="cred-icon" />
                    <div>
                      <span className="cred-label">Hotline điều hành 24/7</span>
                      <b className="cred-val">{providerInfo.hotline}</b>
                    </div>
                  </div>
                  <div className="cred-item">
                    <FaMapMarkerAlt className="cred-icon" />
                    <div>
                      <span className="cred-label">Trụ sở điều hành</span>
                      <b className="cred-val">{providerInfo.address}</b>
                    </div>
                  </div>
                  <div className="cred-item">
                    <FaShieldAlt className="cred-icon" />
                    <div>
                      <span className="cred-label">Chính sách bảo trợ</span>
                      <b className="cred-val">Bảo lãnh chất lượng bởi Du Lịch Việt</b>
                    </div>
                  </div>
                </div>
                <div className="organizer-action-row">
                  <Link to={`/tours?provider=${providerInfo.id}`} className="btn-provider-tours">
                    Xem tất cả tour do {providerInfo.shortName} tổ chức
                    <FaChevronRight style={{ fontSize: '0.75rem', marginLeft: '6px' }} />
                  </Link>
                </div>
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
                  <h3 className="policy-heading"><FaShieldAlt /> Quy định & Chính sách áp dụng cho chuyến đi</h3>
                  
                  <div className="policy-grid">
                    <div className="policy-detail-card">
                      <div className="policy-card-header text-amber" style={{ color: '#d97706' }}>
                        <FaChild style={{ color: '#d97706' }} /> Chính Sách Giá Vé Trẻ Em
                      </div>
                      <ul className="policy-card-list">
                        <li><strong>Dưới 2 tuổi:</strong> 10% giá vé người lớn (miễn phí ăn ngủ cùng bố mẹ, có bảo hiểm).</li>
                        <li><strong>Từ 2 đến dưới 10 tuổi:</strong> 75% giá tour (có ghế ngồi riêng trên xe, suất ăn riêng, ngủ chung giường với bố mẹ).</li>
                        <li><strong>Từ 11 tuổi trở lên:</strong> Tính 100% tiêu chuẩn người lớn (đầy đủ giường riêng, suất ăn).</li>
                      </ul>
                    </div>

                    <div className="policy-detail-card">
                      <div className="policy-card-header text-danger" style={{ color: '#dc2626' }}>
                        <FaCalendarCheck style={{ color: '#dc2626' }} /> Điều Kiện Hoàn Hủy Tour Linh Hoạt
                      </div>
                      <ul className="policy-card-list">
                        <li><strong>Hủy trước 20 ngày:</strong> Miễn phí 100% (hoàn tiền không thu phí chuyển khoản).</li>
                        <li><strong>Hủy từ 10 - 19 ngày:</strong> Phí hủy 30% tổng giá trị dịch vụ tour.</li>
                        <li><strong>Hủy từ 05 - 09 ngày:</strong> Phí hủy 50% tổng giá trị tour.</li>
                        <li><strong>Hủy dưới 05 ngày hoặc vắng mặt:</strong> Phí hủy 100% theo quy định hàng không/khách sạn.</li>
                      </ul>
                    </div>

                    <div className="policy-detail-card">
                      <div className="policy-card-header text-primary" style={{ color: '#0194f3' }}>
                        <FaShieldAlt style={{ color: '#0194f3' }} /> Bảo Hiểm Du Lịch & Hỗ Trợ Y Tế
                      </div>
                      <ul className="policy-card-list">
                        <li>Bảo hiểm du lịch nội địa mức bồi thường tối đa <strong>100.000.000 VNĐ/khách/vụ</strong>.</li>
                        <li>Tour quốc tế được bảo hiểm toàn cầu mức bồi thường <strong>1.000.000.000 VNĐ (1 Tỷ đồng)</strong>.</li>
                        <li>Tổng đài hỗ trợ cứu hộ khẩn cấp y tế Bảo Việt Tourism Care sẵn sàng 24/7.</li>
                      </ul>
                    </div>

                    <div className="policy-detail-card">
                      <div className="policy-card-header text-success" style={{ color: '#16a34a' }}>
                        <FaBuilding style={{ color: '#16a34a' }} /> Chính Sách Khách Đoàn Doanh Nghiệp (B2B)
                      </div>
                      <ul className="policy-card-list">
                        <li><strong>Chiết khấu 5%:</strong> Tự động giảm trực tiếp khi đăng ký đoàn từ 10 khách trở lên.</li>
                        <li><strong>Hóa đơn VAT điện tử:</strong> Hỗ trợ xuất hóa đơn tài chính hợp lệ ngay trong ngày.</li>
                        <li><strong>Gala Dinner & Teambuilding:</strong> Hỗ trợ thiết kế backdrop chụp ảnh và MC teambuilding.</li>
                      </ul>
                    </div>
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

                  {/* Customer Reviews & Feedback Section */}
                  <div className="customer-reviews-section">
                    <div className="reviews-section-header">
                      <h4 className="reviews-title">
                        <FaComments style={{ color: '#0194f3', marginRight: '8px' }} />
                        Nhận xét từ du khách đã tham gia chuyến đi ({reviewsList.length} đánh giá)
                      </h4>
                      <button 
                        type="button" 
                        className="btn btn-outline-primary btn-sm btn-open-review"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <FaPen style={{ marginRight: '6px' }} /> {showReviewForm ? 'Đóng biểu mẫu' : 'Viết đánh giá của bạn'}
                      </button>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="write-review-box animate-fade-in mb-4">
                        <h5 className="write-review-heading">Chia sẻ cảm nhận thực tế của bạn về chuyến đi</h5>
                        <form onSubmit={handleCustomReviewSubmit}>
                          <div className="form-row-grid">
                            <div className="form-group">
                              <label style={{ fontSize: '0.84rem', fontWeight: '600', color: '#334155' }}>Họ và tên của bạn:</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Ví dụ: Nguyễn Văn An"
                                value={newReviewName} 
                                onChange={e => setNewReviewName(e.target.value)} 
                                required 
                              />
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.84rem', fontWeight: '600', color: '#334155' }}>Hình thức chuyến đi:</label>
                              <select 
                                className="form-control"
                                value={newReviewType}
                                onChange={e => setNewReviewType(e.target.value)}
                              >
                                <option value="Gia đình">Gia đình có trẻ em / người lớn tuổi</option>
                                <option value="Cặp đôi">Cặp đôi / Nghỉ dưỡng</option>
                                <option value="Khách đoàn B2B">Đoàn thể Doanh nghiệp (B2B)</option>
                                <option value="Nhóm bạn">Nhóm bạn bè</option>
                                <option value="Một mình">Du lịch cá nhân (Solo)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label style={{ fontSize: '0.84rem', fontWeight: '600', color: '#334155' }}>Đánh giá số sao:</label>
                              <div className="star-rating-select">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <FaStar 
                                    key={s} 
                                    className={`star-select-icon ${s <= newReviewRating ? 'active' : ''}`}
                                    onClick={() => setNewReviewRating(s)}
                                  />
                                ))}
                                <span className="rating-select-text">{newReviewRating}/5 Sao</span>
                              </div>
                            </div>
                          </div>
                          <div className="form-group mt-2">
                            <label style={{ fontSize: '0.84rem', fontWeight: '600', color: '#334155' }}>Nội dung nhận xét chi tiết:</label>
                            <textarea 
                              className="form-control" 
                              rows="3" 
                              placeholder="Hãy chia sẻ trải nghiệm về khách sạn, xe đưa đón, hướng dẫn viên, ẩm thực và cảnh quan..."
                              value={newReviewComment}
                              onChange={e => setNewReviewComment(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <div className="form-action-row mt-3">
                            <button type="submit" className="btn btn-primary" style={{ borderRadius: '20px', padding: '8px 22px' }}>
                              <FaCheckCircle style={{ marginRight: '6px' }} /> Đăng đánh giá ngay
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Filter Pills */}
                    <div className="reviews-filter-pills mb-3">
                      {['Tất cả', 'Có hình ảnh', '5 Sao', '4 Sao', 'Gia đình', 'Cặp đôi', 'Khách đoàn B2B'].map(f => (
                        <button 
                          key={f}
                          type="button" 
                          className={`filter-pill-btn ${reviewFilter === f ? 'active' : ''}`}
                          onClick={() => setReviewFilter(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-cards-list">
                      {filteredReviews.map(r => (
                        <div key={r.id} className="review-card-item">
                          <div className="review-card-header">
                            <div className="reviewer-info-group">
                              <div className="reviewer-avatar-circle" style={{ backgroundColor: r.avatarBg }}>
                                {r.avatarText}
                              </div>
                              <div>
                                <div className="reviewer-name-row">
                                  <span className="reviewer-name">{r.author}</span>
                                  <span className="reviewer-badge-verified">
                                    <FaCheckCircle className="verified-icon" /> Đã đặt qua Du Lịch Việt
                                  </span>
                                </div>
                                <div className="reviewer-meta-sub">
                                  <span className="trip-type-tag">{r.tripType}</span>
                                  <span className="review-date-text">{r.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="review-stars-box">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} style={{ color: i < r.rating ? '#f59e0b' : '#cbd5e1', fontSize: '0.9rem' }} />
                              ))}
                            </div>
                          </div>

                          <p className="review-body-text">{r.comment}</p>

                          {r.photos && r.photos.length > 0 && (
                            <div className="review-photos-thumbnails">
                              {r.photos.map((photoUrl, pIdx) => (
                                <img key={pIdx} src={photoUrl} alt="Ảnh chụp thực tế của khách" className="review-thumb-img" />
                              ))}
                            </div>
                          )}

                          {/* CSKH Response */}
                          {r.cskhReply && (
                            <div className="cskh-reply-box">
                              <div className="cskh-reply-header">
                                <span className="cskh-badge">Chăm sóc khách hàng Du Lịch Việt</span>
                                <span className="cskh-time">{r.cskhReply.date}</span>
                              </div>
                              <p className="cskh-reply-content">{r.cskhReply.text}</p>
                            </div>
                          )}

                          <div className="review-card-footer">
                            <button 
                              type="button" 
                              className="helpful-vote-btn"
                              onClick={() => handleHelpfulVote(r.id)}
                            >
                              <FaThumbsUp /> Hữu ích ({helpfulVotes[r.id] || r.helpfulCount || 12})
                            </button>
                          </div>
                        </div>
                      ))}
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
              
              {/* Upcoming Departure Dates Picker */}
              <div className="departure-schedule-box mb-3">
                <label className="schedule-box-label">
                  <FaCalendarAlt style={{ color: '#0194f3', marginRight: '6px' }} />
                  Chọn ngày khởi hành phù hợp:
                </label>
                <div className="schedule-pills-list">
                  {departureDatesList.map((d, dIdx) => (
                    <div 
                      key={dIdx} 
                      className={`schedule-pill-card ${selectedDepartureDate === d.dateStr || (!selectedDepartureDate && dIdx === 0) ? 'active' : ''}`}
                      onClick={() => setSelectedDepartureDate(d.dateStr)}
                    >
                      <div className="schedule-pill-left">
                        <span className="schedule-pill-dow">{d.dayOfWeek}</span>
                        <span className="schedule-pill-date">{d.dateStr}</span>
                      </div>
                      <div className="schedule-pill-right">
                        <span className={`schedule-seats-badge ${d.seats <= 6 ? 'badge-urgent' : 'badge-ok'}`}>
                          {d.seats <= 6 ? `Sắp hết vé (còn ${d.seats})` : `Còn ${d.seats} chỗ`}
                        </span>
                        <span className="schedule-pill-price">{formatPrice(d.price)}</span>
                      </div>
                    </div>
                  ))}
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
