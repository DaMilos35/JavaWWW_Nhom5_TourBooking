import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaSearch, 
  FaPlaneDeparture, 
  FaHandHoldingUsd, 
  FaShieldAlt, 
  FaHeadset, 
  FaArrowRight, 
  FaCompass,
  FaChevronDown,
  FaCalendarCheck,
  FaAward
} from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FallbackImage from '../components/common/FallbackImage';
import './HomePage.css';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
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
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());
    if (searchCategory) params.set('category', searchCategory);
    if (priceRange) params.set('price', priceRange);
    const query = params.toString();
    navigate(query ? `/tours?${query}` : '/tours');
  };

  const formatTourCount = (count) => {
    const tourCount = Number(count) || 0;
    return `${tourCount} tour`;
  };

  if (loading) return <LoadingSpinner />;

  const featuredTours = tours.slice(0, 6);

  return (
    <div className="homepage">
      {/* Hero Section matching Figma & uploaded design */}
      <section className="hero-container-wrap">
        <div className="container hero-inner-grid">
          {/* Left Column: Typography & Story */}
          <div className="hero-text-col">
            <div className="hero-eyebrow">
              <FaCompass className="text-accent icon" />
              <span>DU LỊCH VIỆT · ĐI THEO CÁCH CỦA BẠN</span>
            </div>

            <h1 className="hero-main-heading">
              Đi xa hơn.<br />
              <span className="text-accent">Chạm sâu hơn.</span>
            </h1>

            <p className="hero-tagline">
              Không chỉ là nơi bạn đến. Là những câu chuyện bạn mang về.
            </p>

            <Link to="/tours" className="hero-next-trip-link">
              Tìm chuyến đi tiếp theo <FaArrowRight className="arrow-icon" />
            </Link>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="hero-visual-col">
            <div className="hero-image-card">
              <img 
                src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85" 
                alt="Hạ Long, Quảng Ninh" 
                className="hero-banner-img"
              />
              <div className="hero-badge-top-right">
                <span>ĐI</span>
                <FaCompass className="badge-compass" />
                <span>ĐỂ NHỚ</span>
              </div>
              <div className="hero-card-tags-overlay">
                <span className="tag-region">VIỆT NAM · MIỀN BẮC</span>
                <span className="tag-location">Hạ Long, Quảng Ninh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Docked Search Bar below Hero (matches image.png dock) */}
        <div className="container hero-dock-search-container">
          <form className="hero-dock-search-bar" onSubmit={handleSearch}>
            {/* Field 1: Journey Intro */}
            <div className="dock-field field-intro" onClick={() => document.getElementById('search-dest-input')?.focus()}>
              <span className="dock-label">BẮT ĐẦU HÀNH TRÌNH</span>
              <span className="dock-value-lead">Tìm một chuyến đi</span>
            </div>

            <div className="dock-divider" />

            {/* Field 2: Destination Keyword */}
            <div className="dock-field field-destination">
              <div className="dock-icon-col">
                <FaMapMarkerAlt className="pin-icon" />
              </div>
              <div className="dock-input-col">
                <label className="dock-label" htmlFor="search-dest-input">ĐIỂM ĐẾN</label>
                <input 
                  id="search-dest-input"
                  type="text" 
                  placeholder="Bạn muốn đi đâu?"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="dock-input"
                />
              </div>
            </div>

            <div className="dock-divider" />

            {/* Field 3: Category Select */}
            <div className="dock-field field-select">
              <div className="dock-input-col">
                <label className="dock-label" htmlFor="search-cat-select">DANH MỤC</label>
                <div className="select-wrapper">
                  <select 
                    id="search-cat-select"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="dock-select"
                  >
                    <option value="">Tất cả tour</option>
                    {categories.map((c) => (
                      <option key={c.id || c.categoryId} value={c.id || c.categoryId}>
                        {c.name || c.categoryName}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="select-arrow" />
                </div>
              </div>
            </div>

            <div className="dock-divider" />

            {/* Field 4: Price Range Select */}
            <div className="dock-field field-select">
              <div className="dock-input-col">
                <label className="dock-label" htmlFor="search-price-select">NGÂN SÁCH</label>
                <div className="select-wrapper">
                  <select 
                    id="search-price-select"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="dock-select"
                  >
                    <option value="">Mọi mức giá</option>
                    <option value="low">Dưới 5 triệu VND</option>
                    <option value="mid">5 - 10 triệu VND</option>
                    <option value="high">Trên 10 triệu VND</option>
                  </select>
                  <FaChevronDown className="select-arrow" />
                </div>
              </div>
            </div>

            {/* Search Submit Button */}
            <button type="submit" className="dock-submit-btn">
              <FaSearch className="btn-search-icon" />
              <span>Tìm tour</span>
            </button>
          </form>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="categories-section container">
        <div className="section-head-bar">
          <div>
            <span className="section-sub-tag">DANH MỤC KHÁM PHÁ</span>
            <h2 className="section-title-clean">Khám phá theo phong cách du lịch</h2>
          </div>
          <Link to="/tours" className="btn btn-outline btn-sm">
            Xem tất cả <FaArrowRight />
          </Link>
        </div>
        
        <div className="category-cards-layout">
          {categories.map((cat) => (
            <Link 
              to={`/tours?category=${cat.id || cat.categoryId}`} 
              key={cat.id || cat.categoryId} 
              className="cat-modern-card"
            >
              <div className="cat-img-box">
                <FallbackImage
                  src={cat.imageUrl}
                  alt={cat.name || cat.categoryName} 
                  className="cat-img"
                  loading="lazy"
                />
              </div>
              <div className="cat-card-details">
                <h3>{cat.name || cat.categoryName}</h3>
                <span className="cat-badge-tours">{formatTourCount(cat.tourCount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tours Grid */}
      <section className="featured-tours-section container">
        <div className="section-head-bar">
          <div>
            <span className="section-sub-tag">HÀNH TRÌNH ĐẶC BIỆT</span>
            <h2 className="section-title-clean">Tour nổi bật đang mở bán</h2>
          </div>
          <Link to="/tours" className="btn btn-outline">
            Tất cả tour <FaArrowRight />
          </Link>
        </div>
        
        {featuredTours.length > 0 ? (
          <div className="home-tour-grid">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        ) : !loadError ? (
          <div className="empty-home-notice">
            <p>Hiện chưa có tour mở bán.</p>
          </div>
        ) : null}
      </section>

      {/* Why Choose Us Features */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-head-center">
            <span className="section-sub-tag">TẠI SAO CHỌN CHÚNG TÔI</span>
            <h2 className="section-title-clean">Trải nghiệm du lịch an tâm & trọn vẹn</h2>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-wrap">
                <FaPlaneDeparture />
              </div>
              <h3>Đa dạng điểm đến</h3>
              <p>Hàng trăm hành trình trong nước và quốc tế được chọn lọc tỉ mỉ cùng hướng dẫn viên tận tâm.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrap">
                <FaHandHoldingUsd />
              </div>
              <h3>Giá tốt & Minh bạch</h3>
              <p>Cam kết giá tốt nhất thị trường, không phí ẩn. Chi tiết từng dịch vụ trước khi quyết định đặt.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrap">
                <FaShieldAlt />
              </div>
              <h3>Bảo hiểm du lịch 100%</h3>
              <p>Mọi hành khách đều được bảo hiểm du lịch trọn gói trong suốt toàn bộ lịch trình chuyến đi.</p>
            </div>

            <div className="why-card">
              <div className="why-icon-wrap">
                <FaHeadset />
              </div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ chuyên viên tư vấn nhiệt tình, sẵn sàng hỗ trợ trực tuyến và qua tổng đài mọi lúc mọi nơi.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
