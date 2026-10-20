import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMapMarkerAlt,
  FaSearch,
  FaPlaneDeparture,
  FaHandHoldingUsd,
  FaShieldAlt,
  FaArrowRight,
  FaRobot,
  FaFire,
  FaMagic,
  FaBolt,
  FaRegClock,
  FaCheckCircle,
  FaChevronRight,
  FaTag
} from 'react-icons/fa';
import { tourApi, categoryApi, aiApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FallbackImage from '../components/common/FallbackImage';
import SelectDropdown from '../components/common/SelectDropdown';
import { toast } from 'react-toastify';
import './HomePage.css';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  
  // Standard Search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');

  // AI Semantic Vector Search state
  const [searchMode, setSearchMode] = useState('standard'); // 'standard' | 'semantic'
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticResults, setSemanticResults] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

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

      // Tải gợi ý cá nhân hóa
      try {
        const recRes = await tourApi.getRecommendations('', 4);
        if (recRes.data && Array.isArray(recRes.data)) {
          setRecommendations(recRes.data);
        }
      } catch (err) {
        console.debug('Không tải được gợi ý homepage:', err);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStandardSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());
    if (searchCategory) params.set('category', searchCategory);
    if (priceRange) params.set('price', priceRange);
    const query = params.toString();
    navigate(query ? `/tours?${query}` : '/tours');
  };

  const handleSemanticSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : semanticQuery).trim();
    if (!q) {
      toast.info('Vui lòng nhập mong muốn của bạn về chuyến đi!');
      return;
    }
    setSemanticLoading(true);
    try {
      const res = await aiApi.semanticSearch(q, 6);
      setSemanticResults(res.data || []);
      // Scroll to semantic results section
      setTimeout(() => {
        const el = document.getElementById('semantic-results-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error('Chưa thể kết nối tới mô hình Vector Database. Đang chuyển tìm kiếm thường.');
      navigate(`/tours?keyword=${encodeURIComponent(q)}`);
    } finally {
      setSemanticLoading(false);
    }
  };

  const handleSemanticSubmit = (e) => {
    e.preventDefault();
    handleSemanticSearch();
  };

  const formatTourCount = (count) => {
    const tourCount = Number(count) || 0;
    return `${tourCount} tour`;
  };

  if (loading) return <LoadingSpinner />;

  // Filter flash deal tours (with badge or discount)
  const flashDeals = tours.filter(t => t.badge || (t.originalPrice && Number(t.originalPrice) > Number(t.price))).slice(0, 4);
  const featuredTours = tours.slice(0, 8);

  const semanticSuggestions = [
    'Tour biển hè lặn ngắm san hô dưới 6 triệu',
    'Nghỉ dưỡng Đà Lạt se lạnh ngắm hoa 3N2Đ',
    'Chinh phục đỉnh Fansipan Sapa ngắm mây',
    'Khám phá di sản miền Trung Đà Nẵng Hội An',
    'Du lịch sinh thái miền Tây sông nước Cái Răng'
  ];

  return (
    <div className="homepage">
      {/* Traveloka Hero Section with Dual Search Modals */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-top-badge">
            <span className="live-dot"></span> Nền tảng Đặt Tour Du Lịch Trực Tuyến & Multi-Vendor Hàng Đầu
          </div>
          <h1 className="hero-title">Khám Phá Việt Nam & Thế Giới<br />Trọn Vẹn Từng Trải Nghiệm</h1>
          <p className="hero-subtitle">
            Hàng trăm lịch trình hấp dẫn từ Vietravel, Saigontourist với giá tốt nhất, xác nhận tức thì và hỗ trợ tìm kiếm bằng AI Vector Database.
          </p>

          {/* Search Tabs: Standard vs AI Semantic */}
          <div className="hero-search-container">
            <div className="search-tab-header">
              <button
                type="button"
                className={`search-tab-btn ${searchMode === 'standard' ? 'active' : ''}`}
                onClick={() => setSearchMode('standard')}
              >
                <FaSearch /> Tìm Kiếm Lữ Hành Tiêu Chuẩn
              </button>
              <button
                type="button"
                className={`search-tab-btn ai-tab ${searchMode === 'semantic' ? 'active' : ''}`}
                onClick={() => setSearchMode('semantic')}
              >
                <FaMagic className="ai-icon-sparkle" /> Tìm Bằng AI Vector Database <span className="tab-pill-badge">MỚI</span>
              </button>
            </div>

            {searchMode === 'standard' ? (
              <form className="search-widget-wrapper" onSubmit={handleStandardSearch}>
                <div className="search-field">
                  <FaMapMarkerAlt className="search-icon" aria-hidden="true" />
                  <div className="search-input-group">
                    <label className="search-label" htmlFor="home-tour-keyword">Điểm đến / Khách sạn</label>
                    <input 
                      id="home-tour-keyword"
                      type="search"
                      placeholder="Phú Quốc, Sapa, Đà Nẵng..." 
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="search-field">
                  <div className="search-input-group">
                    <label className="search-label" htmlFor="home-tour-category">Danh mục tour</label>
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

                <div className="search-field">
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

                <button type="submit" className="btn-search-massive">
                  <FaSearch aria-hidden="true" /> Tìm Tour
                </button>
              </form>
            ) : (
              <div className="semantic-search-wrapper">
                <form className="semantic-form" onSubmit={handleSemanticSubmit}>
                  <div className="semantic-input-wrap">
                    <FaRobot className="semantic-ai-icon" />
                    <input
                      type="text"
                      className="semantic-input"
                      placeholder="Miêu tả mong muốn của bạn (ví dụ: Tour biển 3 ngày cho gia đình có trẻ em, lặn ngắm san hô)..."
                      value={semanticQuery}
                      onChange={(e) => setSemanticQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-semantic-search" disabled={semanticLoading}>
                    {semanticLoading ? <span className="mini-spinner"></span> : <FaMagic />}
                    {semanticLoading ? 'Đang trích xuất vector...' : 'Tìm bằng AI Vector DB'}
                  </button>
                </form>

                <div className="semantic-suggestions">
                  <span className="suggestion-label"><FaBolt /> Gợi ý tìm nhanh:</span>
                  <div className="suggestion-chips">
                    {semanticSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="suggestion-chip"
                        onClick={() => {
                          setSemanticQuery(item);
                          handleSemanticSearch(item);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Semantic Search Results Section (Shown dynamically when user triggers Vector search) */}
      {semanticResults && (
        <section id="semantic-results-section" className="semantic-results-section container">
          <div className="semantic-results-card">
            <div className="semantic-results-header">
              <div>
                <div className="semantic-badge-chip">
                  <FaMagic /> KẾT QUẢ VECTOR DATABASE (COSINE SIMILARITY)
                </div>
                <h2 className="section-title">Các tour phù hợp nhất với mong muốn của bạn</h2>
                <p className="section-subtitle">
                  Tìm thấy <strong>{semanticResults.length}</strong> kết quả được xếp hạng theo độ tương đồng ngữ nghĩa vector.
                </p>
              </div>
              <button
                type="button"
                className="btn-clear-semantic"
                onClick={() => setSemanticResults(null)}
              >
                Đóng kết quả AI
              </button>
            </div>

            {semanticResults.length > 0 ? (
              <div className="semantic-grid">
                {semanticResults.map((item, idx) => {
                  const tourItem = item.tour || item;
                  const score = item.similarityScore ? Math.round(item.similarityScore * 100) : 95 - idx * 3;
                  const reason = item.matchReason || 'Trùng khớp điểm đến và sở thích trải nghiệm';
                  return (
                    <div key={tourItem.id || idx} className="semantic-item-wrap">
                      <div className="semantic-match-banner">
                        <span className="match-score">🎯 Độ khớp: {score}%</span>
                        <span className="match-reason" title={reason}>{reason}</span>
                      </div>
                      <TourCard tour={tourItem} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-semantic-matches">
                <p>Không tìm thấy tour nào có nội dung vector khớp với mô tả của bạn. Hãy thử từ khóa khác!</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Flash Deals / Hot Tours Section (Traveloka Promotion Standard) */}
      {flashDeals.length > 0 && (
        <section className="flash-deal-section container">
          <div className="flash-deal-banner">
            <div className="flash-deal-header">
              <div className="flash-title-wrap">
                <div className="flash-fire-icon"><FaFire /></div>
                <div>
                  <h2 className="flash-title">Ưu Đãi Giờ Vàng · Flash Deals</h2>
                  <p className="flash-subtitle">Các hành trình giá tốt nhất hôm nay - Số lượng có hạn</p>
                </div>
              </div>
              <div className="flash-countdown-pill">
                <FaRegClock /> Kết thúc sau: <b>12:45:00</b>
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
        
        <div className="category-cards">
          {categories.map(cat => (
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
            <h3>AI Vector Search</h3>
            <p>Tìm tour tự nhiên qua mô tả ngôn ngữ người dùng bằng Vector Database Cosine Similarity tiên tiến.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-plane"><FaPlaneDeparture /></div>
            <h3>Đối Tác Hàng Đầu</h3>
            <p>Liên kết trực tiếp với các hãng lữ hành số 1 Việt Nam: Vietravel, Saigontourist và đối tác uy tín.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-price"><FaHandHoldingUsd /></div>
            <h3>Giá Rõ Ràng & B2B</h3>
            <p>Cam kết giá trọn gói minh bạch, giữ chỗ tức thì và chiết khấu ưu đãi cho khách đoàn doanh nghiệp.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper feat-shield"><FaShieldAlt /></div>
            <h3>Bảo Hiểm Trọn Gói</h3>
            <p>Mọi hành trình đều bao gồm bảo hiểm du lịch lên đến 100 triệu đồng và hỗ trợ 24/7 suốt tuyến.</p>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations based on User Activity */}
      {recommendations && recommendations.length > 0 && (
        <section className="featured-tours-section container">
          <div className="section-header">
            <div>
              <div className="personalized-badge">
                <span>✨</span> CÁ NHÂN HÓA DÀNH CHO BẠN
              </div>
              <h2 className="section-title">Gợi Ý Dựa Trên Sở Thích Của Bạn</h2>
              <p className="section-subtitle">Dựa trên lịch sử tìm kiếm, danh mục và hành vi trải nghiệm của bạn</p>
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
            Xem Tất Cả ({tours.length}) <FaArrowRight />
          </Link>
        </div>
        
        {featuredTours.length > 0 ? (
          <div className="tour-grid">
            {featuredTours.map(tour => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        ) : !loadError ? (
          <div className="homepage-error card-surface">
            <p>Hiện chưa có tour mở bán.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default HomePage;
