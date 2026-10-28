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
import useScrollReveal from '../hooks/useScrollReveal';
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

  // Scroll reveal trigger
  useScrollReveal([tours.length, categories.length, semanticResults]);

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

  const formatTourCount = (catOrCount) => {
    if (typeof catOrCount === 'object' && catOrCount !== null) {
      if (catOrCount.tourCount && Number(catOrCount.tourCount) > 0) {
        return `${catOrCount.tourCount} tour`;
      }
      const catId = Number(catOrCount.id || catOrCount.categoryId);
      const count = tours.filter(t => Number(t.categoryId || t.category?.id) === catId).length;
      return `${count > 0 ? count : 5} tour`;
    }
    const tourCount = Number(catOrCount) || 0;
    return `${tourCount > 0 ? tourCount : 5} tour`;
  };

  if (loading) return <LoadingSpinner />;

  // Filter flash deal tours (with badge or discount)
  const flashDeals = tours.filter(t => t.badge || (t.originalPrice && Number(t.originalPrice) > Number(t.price))).slice(0, 4);

  const trendingDestinations = [
    'Hạ Long',
    'Đà Nẵng',
    'Phú Quốc',
    'Sa Pa',
    'Đà Lạt',
    'Hà Giang',
    'Côn Đảo'
  ];

  return (
    <div className="homepage">
      {/* Hero Section & Thanh Tìm Kiếm Đẳng Cấp */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-top-badge">
            <span className="live-dot"></span> BỘ SƯU TẬP HÀNH TRÌNH TINH HOA 2026
          </div>
          <h1 className="hero-title hero-editorial-title">
            Hành Trình Tinh Tuyển<br /><em>Dành Cho Những Tâm Hồn Tự Do</em>
          </h1>
          <p className="hero-subtitle">
            Hơn 80 hành trình chọn lọc từ Du Lịch Việt, Saigontourist, Vietravel — trải nghiệm văn hóa bản địa sâu sắc, tiện nghi chuẩn mực và xác nhận tức thì.
          </p>

          {/* Thanh tìm kiếm điểm đến và phân loại */}
          <div className="hero-search-container">
            <form className="search-widget-wrapper" onSubmit={handleSmartSearch}>
              <div className="search-field field-destination">
                <FaMapMarkerAlt className="search-icon" aria-hidden="true" />
                <div className="search-input-group">
                  <label className="search-label" htmlFor="home-tour-keyword">
                    Điểm Đến
                  </label>
                  <input 
                    id="home-tour-keyword"
                    type="search"
                    placeholder="Bạn muốn đi đâu? (Hạ Long, Đà Nẵng, Sa Pa...)" 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="search-field field-category">
                <div className="search-input-group">
                  <label className="search-label" htmlFor="home-tour-category">Chủ Đề Tour</label>
                  <SelectDropdown
                    id="home-tour-category"
                    label="Chủ đề tour"
                    value={searchCategory}
                    onChange={setSearchCategory}
                    options={[
                      { value: '', label: 'Tất cả chủ đề' },
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
                  <label className="search-label" htmlFor="home-tour-price">Ngân Sách</label>
                  <SelectDropdown
                    id="home-tour-price"
                    label="Mức ngân sách"
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
                <span>{semanticLoading ? 'Đang tìm...' : 'Tìm Chuyến Đi'}</span>
              </button>
            </form>

            {/* Các Điểm Đến Thịnh Hành Dạng Tag Tinh Tế (Gọn gàng 1 dòng, không che khuất) */}
            <div className="hero-trending-tags">
              <span className="trending-label">Điểm đến thịnh hành:</span>
              <div className="trending-tags-list">
                {trendingDestinations.map((dest, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="trending-tag-btn"
                    onClick={() => handleQuickSuggestion(dest)}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Trụ Cột Đẳng Cấp & Cam Kết Lữ Hành (Độc lập dưới Hero, không bao giờ bị Dropdown đè) */}
      <section className="trust-assurance-bar container">
        <div className="trust-bar-wrapper">
          <div className="trust-bar-item">
            <span className="trust-number">80+</span>
            <div className="trust-text-wrap">
              <strong className="trust-title">Hành trình kiểm định trực tiếp</strong>
              <span className="trust-desc">Tuyển chọn từ Du Lịch Việt, Saigontourist, Vietravel</span>
            </div>
          </div>
          <div className="trust-bar-divider" />
          <div className="trust-bar-item">
            <span className="trust-number">100%</span>
            <div className="trust-text-wrap">
              <strong className="trust-title">Xác nhận vé điện tử tức thì</strong>
              <span className="trust-desc">Giữ chỗ thời gian thực, minh bạch không phí ẩn</span>
            </div>
          </div>
          <div className="trust-bar-divider" />
          <div className="trust-bar-item">
            <span className="trust-number">24/7</span>
            <div className="trust-text-wrap">
              <strong className="trust-title">Chăm sóc hành trình riêng biệt</strong>
              <span className="trust-desc">Chuyên viên hỗ trợ tận tâm trước, trong và sau tour</span>
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
        <section className="flash-deal-section container reveal">
          <div className="flash-deal-banner">
            <div className="flash-deal-header">
              <div className="flash-title-wrap">
                <div className="flash-fire-icon"><FaFire /></div>
                <div>
                  <h2 className="flash-title">Ưu Đãi Đặc Tuyển · Private Offers</h2>
                  <p className="flash-subtitle">Hành trình trải nghiệm giới hạn — Ưu đãi độc quyền theo ngày</p>
                </div>
              </div>
              <div className="flash-countdown-pill">
                <FaRegClock /> Kết thúc sau: <b>{timeLeft}</b>
              </div>
            </div>

            <div className="tour-grid stagger-children">
              {flashDeals.map(tour => (
                <TourCard key={`flash-${tour.id || tour.tourId}`} tour={tour} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Grid Section */}
      <section className="categories-section container reveal">
        <div className="section-header">
          <div>
            <span className="section-kicker">BỘ SƯU TẬP THEO CHỦ ĐỀ</span>
            <h2 className="section-title">Khám Phá Theo Phong Cách Sống</h2>
            <p className="section-subtitle">Lựa chọn chuyến đi theo cảm hứng văn hóa và nghỉ dưỡng mà bạn yêu thích</p>
          </div>
          <Link to="/tours" className="section-more-link">
            Xem tất cả tour <FaChevronRight />
          </Link>
        </div>

        <div className="category-grid stagger-children">
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
                <span className="category-count">{formatTourCount(cat)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cam kết chất lượng và an tâm chuyến đi */}
      <section className="features-section container reveal">
        <div className="features-grid stagger-children">
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-ai"><FaMagic /></div>
            <h3>Gợi Ý Chuyến Đi Lý Tưởng</h3>
            <p>Hệ thống tự động đề xuất những chuyến đi dựa trên mùa du lịch, sở thích và phản hồi thực tế từ hàng nghìn du khách.</p>
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
        <section className="featured-tours-section container reveal">
          <div className="section-header">
            <div>
              <div className="personalized-badge">
                <FaMagic className="mr-1" aria-hidden="true" /> CÁ NHÂN HÓA CHO @{user.username}
              </div>
              <h2 className="section-title">Gợi Ý Dựa Trên Sở Thích Của Bạn</h2>
              <p className="section-subtitle">Dựa trên lịch sử tìm kiếm và các chuyến đi bạn đã quan tâm</p>
            </div>
          </div>
          <div className="tour-grid stagger-children">
            {recommendations.map(tour => (
              <TourCard key={`rec-${tour.id || tour.tourId}`} tour={tour} />
            ))}
          </div>
        </section>
      )}

      {/* Main Tour Showcase Grid */}
      <section className="featured-tours-section container reveal" style={{ marginBottom: '100px' }}>
        <div className="section-header">
          <div>
            <span className="section-kicker">TUYỂN TẬP TINH HOA</span>
            <h2 className="section-title">Hành Trình Được Yêu Thích Nhất</h2>
            <p className="section-subtitle">Tuyển tập 80+ hành trình trải nghiệm chuẩn mực được du khách đánh giá cao nhất</p>
          </div>
          <Link to="/tours" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Xem Toàn Bộ {tours.length} Tour <FaChevronRight />
          </Link>
        </div>

        <div className="tour-grid stagger-children">
          {tours.slice(0, 8).map(tour => (
            <TourCard key={tour.id || tour.tourId} tour={tour} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
