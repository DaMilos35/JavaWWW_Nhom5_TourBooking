import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaPlaneDeparture, FaHandHoldingUsd, FaShieldAlt, FaHeadset, FaArrowRight, FaRobot } from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FallbackImage from '../components/common/FallbackImage';
import SelectDropdown from '../components/common/SelectDropdown';
import './HomePage.css';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
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
      setTours(toursRes.data);
      setCategories(catsRes.data);

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

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('keyword', searchKeyword.trim());
    if (searchCategory) params.set('category', searchCategory);
    if (priceRange) params.set('price', priceRange);
    const query = params.toString();
    navigate(query ? `/tours?${query}` : '/tours');
  };

  const retryLoading = () => {
    fetchData();
  };

  const formatTourCount = (count) => {
    const tourCount = Number(count) || 0;
    return `${tourCount} tour`;
  };

  if (loading) return <LoadingSpinner />;

  const featuredTours = tours.slice(0, 8);

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Tìm tour phù hợp<br />cho chuyến đi sắp tới</h1>
          <p className="hero-subtitle">So sánh điểm đến, lịch trình và giá trước khi đặt tour.</p>
          
          <form className="search-widget-wrapper" onSubmit={handleSearch}>
            <div className="search-field">
              <FaMapMarkerAlt className="search-icon" aria-hidden="true" />
              <div className="search-input-group">
                <label className="search-label" htmlFor="home-tour-keyword">Điểm đến</label>
                <input 
                  id="home-tour-keyword"
                  type="search"
                  placeholder="Bạn muốn đi đâu?" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="search-field">
              <div className="search-input-group">
                <label className="search-label" htmlFor="home-tour-category">Danh mục</label>
                <SelectDropdown
                  id="home-tour-category"
                  label="Danh mục"
                  value={searchCategory}
                  onChange={setSearchCategory}
                  options={[
                    { value: '', label: 'Tất cả tour' },
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
                <label className="search-label" htmlFor="home-tour-price">Ngân sách</label>
                <SelectDropdown
                  id="home-tour-price"
                  label="Ngân sách"
                  value={priceRange}
                  onChange={setPriceRange}
                  options={[
                    { value: '', label: 'Mọi mức giá' },
                    { value: 'low', label: 'Dưới 5 triệu' },
                    { value: 'mid', label: '5–10 triệu' },
                    { value: 'high', label: 'Trên 10 triệu' },
                  ]}
                />
              </div>
            </div>

            <button type="submit" className="btn-search-massive">
              <FaSearch aria-hidden="true" /> Tìm Kiếm
            </button>
          </form>
        </div>
      </section>

      {loadError && (
        <div className="container">
          <div className="homepage-error card-surface" role="alert">
            <p>Chưa tải được danh sách tour. Kiểm tra kết nối máy chủ rồi thử lại.</p>
            <button type="button" className="btn btn-outline" onClick={retryLoading}>Thử lại</button>
          </div>
        </div>
      )}

      <section className="categories-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Tour theo danh mục</h2>
            <p className="section-subtitle">Chọn nhóm tour bạn muốn khám phá</p>
          </div>
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

      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper" style={{ background: 'linear-gradient(135deg, #0284c7, #7c3aed)', color: '#fff' }}><FaRobot /></div>
            <h3>Trợ lý AI Thông Minh</h3>
            <p>Tư vấn chọn tour 24/7 và lên lịch trình tự động theo đúng ngân sách của bạn.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaPlaneDeparture /></div>
            <h3>Nhiều lựa chọn</h3>
            <p>Hành trình trong nước, quốc tế và nghỉ dưỡng đa dạng tuyến điểm.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaHandHoldingUsd /></div>
            <h3>Giá minh bạch</h3>
            <p>Cập nhật số chỗ còn lại và giá vé chuẩn xác trước khi giữ chỗ.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaShieldAlt /></div>
            <h3>Theo dõi đơn hàng</h3>
            <p>Quản lý trạng thái, hóa đơn điện tử và lịch sử đặt tour trực tuyến dễ dàng.</p>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations based on User Activity */}
      {recommendations && recommendations.length > 0 && (
        <section className="featured-tours-section container" style={{ marginBottom: '60px' }}>
          <div className="section-header">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
                <span>✨</span> CÁ NHÂN HÓA DÀNH CHO BẠN
              </div>
              <h2 className="section-title">Gợi ý tour phù hợp nhất</h2>
              <p className="section-subtitle">Dựa trên lịch sử tìm kiếm, danh mục ưa thích và hành vi trải nghiệm của bạn</p>
            </div>
          </div>
          <div className="tour-grid">
            {recommendations.map(tour => (
              <TourCard key={`rec-${tour.id || tour.tourId}`} tour={tour} />
            ))}
          </div>
        </section>
      )}

      <section className="featured-tours-section container" style={{ marginBottom: '100px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Tour đang mở bán</h2>
            <p className="section-subtitle">Xem thông tin và giá của các tour hiện có</p>
          </div>
          <Link to="/tours" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Xem Tất Cả <FaArrowRight />
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
