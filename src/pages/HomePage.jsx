import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SelectDropdown from '../components/common/SelectDropdown';
import FallbackImage from '../components/common/FallbackImage';
import { tourApi, categoryApi, aiApi } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
  FaSearch, FaMapMarkerAlt, FaRegClock, FaFire, 
  FaHandHoldingUsd, FaShieldAlt, FaPlaneDeparture,
  FaChevronRight, FaMagic, FaTimes
} from 'react-icons/fa';
import './HomePage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Unified Smart Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // AI Semantic Vector Search state (embedded)
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticResults, setSemanticResults] = useState(null);
  const [activeQuery, setActiveQuery] = useState('');

  // Recommendations state (Chỉ kích hoạt khi user đã đăng nhập)
  const [recommendations, setRecommendations] = useState([]);
  const [timeLeft, setTimeLeft] = useState('12:45:00');
  const navigate = useNavigate();

  // Đếm ngược thực tế (Live countdown ticker chuẩn OTA)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [toursRes, catsRes] = await Promise.all([
        tourApi.getAll(),
        categoryApi.getAll()
      ]);
      setTours(toursRes.data || []);
      setCategories(catsRes.data || []);

      // Tải gợi ý cá nhân hóa CHỈ khi tài khoản đã đăng nhập
      if (user) {
        try {
          const recRes = await tourApi.getRecommendations('', 4);
          if (recRes.data && Array.isArray(recRes.data)) {
            setRecommendations(recRes.data);
          }
        } catch (err) {
          console.debug('Không tải được gợi ý homepage:', err);
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSmartSearch = async (e, customQuery) => {
    if (e) e.preventDefault();
    const query = (customQuery !== undefined ? customQuery : searchKeyword).trim();

    const isDescriptiveQuery = query.split(/\s+/).length >= 3 || 
      /du thuyền|nghỉ dưỡng|săn mây|gia đình|trẻ em|lặn|mạo hiểm|leo núi|giá rẻ|cao cấp|5 sao/i.test(query);

    if (query && isDescriptiveQuery && !searchCategory && !priceRange) {
      setSemanticLoading(true);
      setActiveQuery(query);
      try {
        const res = await aiApi.semanticSearch(query, 6);
        setSemanticResults(res.data || []);
        setTimeout(() => {
          const el = document.getElementById('semantic-results-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (err) {
        const params = new URLSearchParams();
        params.set('keyword', query);
        navigate(`/tours?${params.toString()}`);
      } finally {
        setSemanticLoading(false);
      }
    } else {
      const params = new URLSearchParams();
      if (query) params.set('keyword', query);
      if (searchCategory) params.set('category', searchCategory);
      if (priceRange) params.set('price', priceRange);
      const qStr = params.toString();
      navigate(qStr ? `/tours?${qStr}` : '/tours');
    }
  };

  const handleQuickSuggestion = (suggestionText) => {
    setSearchKeyword(suggestionText);
    handleSmartSearch(null, suggestionText);
  };

  const formatTourCount = (count) => {
    const tourCount = Number(count) || 0;
    return `${tourCount} tour`;
  };

  if (loading) return <LoadingSpinner />;

  // Filter flash deal tours (with badge or discount)
  const flashDeals = tours.filter(t => t.badge || (t.originalPrice && Number(t.originalPrice) > Number(t.price))).slice(0, 4);

  const smartSuggestions = [
    'Du thuyền 5 sao vịnh Hạ Long ngắm hoàng hôn',
    'Tour săn mây Tà Xùa Sa Pa cho 2 người',
    'Nghỉ dưỡng biển Phú Quốc cho gia đình có trẻ em',
    'Khám phá di sản miền Trung Đà Nẵng Hội An',
    'Sông nước miệt vườn Cần Thơ Chợ Nổi Cái Răng'
  ];

  return (
    <div className="homepage">
      {/* Traveloka Hero Section with Seamless Smart Search */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-top-badge">
            <span className="live-dot"></span> Sàn Thương Mại Điện Tử Du Lịch Hàng Đầu Việt Nam
          </div>
          <h1 className="hero-title">Khám Phá Việt Nam & Thế Giới<br />Trọn Vẹn Từng Trải Nghiệm</h1>
          <p className="hero-subtitle">
            Hơn 40 hành trình chọn lọc từ Vietravel, Saigontourist, xác nhận vé điện tử tức thì và hỗ trợ tìm kiếm bằng công nghệ AI thông minh.
          </p>

          {/* Thanh Tìm Kiếm Hợp Nhất Thông Minh (Lồng Vector Search Ngầm) */}
          <div className="hero-search-container">
            <form className="search-widget-wrapper" onSubmit={handleSmartSearch}>
              <div className="search-field field-destination">
                <FaMapMarkerAlt className="search-icon" aria-hidden="true" />
                <div className="search-input-group">
                  <label className="search-label" htmlFor="home-tour-keyword">
                    Bạn muốn đi đâu hoặc kỳ nghỉ thế nào?
                  </label>
                  <input 
                    id="home-tour-keyword"
                    type="search"
                    placeholder="Điểm đến, hoặc miêu tả kỳ nghỉ (VD: Du thuyền Hạ Long, Biển gia đình...)" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="search-field field-category">
                <div className="search-input-group">
                  <label className="search-label" htmlFor="home-tour-category">Danh mục loại hình</label>
                  <SelectDropdown
                    id="home-tour-category"
                    label="Danh mục"
                    value={searchCategory}
                    onChange={setSearchCategory}
                    options={[
                      { value: '', label: 'Tất cả loại hình' },
                      ...categories.map((category) => ({
                        value: String(category.id || category.categoryId),
                        label: category.name || category.categoryName,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="search-field field-price">
                <div className="search-input-group">
                  <label className="search-label" htmlFor="home-tour-price">Khoảng ngân sách</label>
                  <SelectDropdown
                    id="home-tour-price"
                    label="Ngân sách"
                    value={priceRange}
                    onChange={setPriceRange}
                    options={[
                      { value: '', label: 'Mọi mức giá' },
                      { value: 'low', label: 'Dưới 5 triệu' },
                      { value: 'mid', label: '5 – 10 triệu' },
                      { value: 'high', label: 'Trên 10 triệu' },
                    ]}
                  />
                </div>
              </div>

              <button type="submit" className="btn-search-massive" disabled={semanticLoading}>
                {semanticLoading ? (
                  <span className="mini-spinner"></span>
                ) : (
                  <FaSearch aria-hidden="true" />
                )}
                <span>{semanticLoading ? 'Đang phân tích...' : 'Tìm Chuyến Đi'}</span>
              </button>
            </form>

            {/* Các Gợi Ý Ý Tưởng Tìm Kiếm Nhanh */}
            <div className="smart-search-hints mt-3">
              <span className="hints-label">
                <FaMagic className="hint-icon" aria-hidden="true" /> Gợi ý tìm kiếm:
              </span>
              <div className="hints-chips-list">
                {smartSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="hint-chip-btn"
                    onClick={() => handleQuickSuggestion(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kết Quả Tìm Kiếm Ngữ Nghĩa Vector */}
      {semanticResults && (
        <section id="semantic-results-section" className="semantic-results-section container animate-fade-in">
          <div className="semantic-results-card">
            <div className="semantic-results-header">
              <div>
                <div className="semantic-badge-chip">
                  <FaMagic /> GỢI Ý PHÙ HỢP VỚI MONG MUỐN CỦA BẠN
                </div>
                <h2 className="section-title">Hành trình phù hợp nhất cho: "{activeQuery}"</h2>
                <p className="section-subtitle">
                  Tìm thấy <strong>{semanticResults.length}</strong> chuyến đi khớp với sở thích và phong cách của bạn.
                </p>
              </div>
              <button
                type="button"
                className="btn-clear-semantic"
                onClick={() => setSemanticResults(null)}
              >
                <FaTimes /> Đóng kết quả gợi ý
              </button>
            </div>

            {semanticResults.length > 0 ? (
              <div className="semantic-grid">
                {semanticResults.map((item, idx) => {
                  const tourItem = item.tour || item;
                  const matchPercent = item.similarityScore 
                    ? Math.min(99, Math.round(item.similarityScore * 100) + 15) 
                    : 98 - idx * 2;
                  const reason = item.matchReason || 'Trùng khớp mong muốn và điểm đến yêu thích';
                  return (
                    <div key={tourItem.id || idx} className="semantic-item-wrap">
                      <div className="semantic-match-banner">
                        <span className="match-score">
                          <FaMagic className="match-icon" aria-hidden="true" /> Phù hợp: {matchPercent}%
                        </span>
                        <span className="match-reason" title={reason}>{reason}</span>
                      </div>
                      <TourCard tour={tourItem} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-semantic-matches">
                <p>Không tìm thấy tour nào khớp với mô tả. Hãy thử tìm kiếm với các từ khóa địa danh!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Flash Deals / Hot Tours Section với Đồng Hồ Đếm Ngược Thực Tế */}
      {flashDeals.length > 0 && (
        <section className="flash-deal-section container">
          <div className="flash-deal-banner">
            <div className="flash-deal-header">
              <div className="flash-title-wrap">
                <div className="flash-fire-icon"><FaFire /></div>
                <div>
                  <h2 className="flash-title">Ưu Đãi Giờ Vàng · Flash Deals</h2>
                  <p className="flash-subtitle">Các hành trình giá tốt nhất hôm nay - Giữ chỗ tức thì</p>
                </div>
              </div>
              <div className="flash-countdown-pill">
                <FaRegClock /> Kết thúc sau: <b>{timeLeft}</b>
              </div>
            </div>

            <div className="tour-grid">
              {flashDeals.map(tour => (
                <TourCard key={`flash-${tour.id || tour.tourId}`} tour={tour} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Grid Section */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <span className="section-kicker">DANH MỤC ĐIỂM ĐẾN</span>
            <h2 className="section-title">Khám Phá Theo Chủ Đề Du Lịch</h2>
            <p className="section-subtitle">Lựa chọn chuyến đi theo phong cách trải nghiệm mà bạn yêu thích</p>
          </div>
          <Link to="/tours" className="section-more-link">
            Xem tất cả tour <FaChevronRight />
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link to={`/tours?category=${cat.id || cat.categoryId}`} key={cat.id || cat.categoryId} className="category-card">
              <FallbackImage
                src={cat.imageUrl}
                alt={cat.name || cat.categoryName} 
                className="category-img"
                loading="lazy"
              />
              <div className="category-overlay">
                <h3>{cat.name || cat.categoryName}</h3>
                <span className="category-count">{formatTourCount(cat.tourCount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Traveloka Trust & Value Pillars */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-ai"><FaMagic /></div>
            <h3>Gợi Ý Thông Minh Bằng AI</h3>
            <p>Hệ thống tự động thấu hiểu mong muốn và sở thích chuyến đi của bạn để đề xuất hành trình hoàn hảo.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-plane"><FaPlaneDeparture /></div>
            <h3>Đối Tác Uy Tín Hàng Đầu</h3>
            <p>Liên kết trực tiếp với các hãng lữ hành số 1 Việt Nam: Vietravel, Saigontourist và đối tác uy tín.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-price"><FaHandHoldingUsd /></div>
            <h3>Giá Rõ Ràng & Ưu Đãi B2B</h3>
            <p>Cam kết giá trọn gói minh bạch, giữ chỗ tức thì và chiết khấu ưu đãi cho khách đoàn doanh nghiệp.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-shield"><FaShieldAlt /></div>
            <h3>Bảo Hiểm Trọn Gói 24/7</h3>
            <p>Mọi hành trình đều bao gồm bảo hiểm du lịch lên đến 100 triệu đồng và hỗ trợ chuyên viên suốt tuyến.</p>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations based on User Activity (Chỉ hiển thị khi đã đăng nhập) */}
      {user && recommendations && recommendations.length > 0 && (
        <section className="featured-tours-section container">
          <div className="section-header">
            <div>
              <div className="personalized-badge">
                <FaMagic className="mr-1" aria-hidden="true" /> CÁ NHÂN HÓA CHO @{user.username}
              </div>
              <h2 className="section-title">Gợi Ý Dựa Trên Sở Thích Của Bạn</h2>
              <p className="section-subtitle">Dựa trên lịch sử tìm kiếm và các chuyến đi bạn đã quan tâm</p>
            </div>
          </div>
          <div className="tour-grid">
            {recommendations.map(tour => (
              <TourCard key={`rec-${tour.id || tour.tourId}`} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {/* Main Tour Showcase Grid */}
      <section className="featured-tours-section container" style={{ marginBottom: '100px' }}>
        <div className="section-header">
          <div>
            <span className="section-kicker">DANH SÁCH MỞ BÁN</span>
            <h2 className="section-title">Hành Trình Được Yêu Thích Nhất</h2>
            <p className="section-subtitle">Khám phá và đặt chỗ ngay các tour chất lượng cao đang sẵn sàng phục vụ</p>
          </div>
          <Link to="/tours" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Xem Toàn Bộ {tours.length} Tour <FaChevronRight />
          </Link>
        </div>

        <div className="tour-grid">
          {tours.slice(0, 8).map(tour => (
            <TourCard key={tour.id || tour.tourId} tour={tour} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
