import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaPlaneDeparture, FaHandHoldingUsd, FaShieldAlt, FaHeadset, FaArrowRight, FaRegCompass } from 'react-icons/fa';
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
        <div className="hero-content">
          <p className="hero-kicker"><FaRegCompass aria-hidden="true" /> DU LỊCH VIỆT · ĐI THEO CÁCH CỦA BẠN</p>
          <h1 className="hero-title">Đi xa hơn.<br /><em>Chạm sâu hơn.</em></h1>
          <p className="hero-subtitle">Không chỉ là nơi bạn đến. Là những câu chuyện bạn mang về.</p>
          <Link to="/tours" className="hero-discover-link">
            Tìm chuyến đi tiếp theo <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="hero-visual">
          <FallbackImage
            src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=85"
            alt="Vịnh Hạ Long với những dãy núi đá vôi và thuyền du lịch"
            className="hero-image"
          />
          <div className="hero-image-caption">
            <span>VIỆT NAM · MIỀN BẮC</span>
            <span>Hạ Long, Quảng Ninh</span>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>ĐI</span><FaRegCompass /><span>ĐỂ NHỚ</span>
          </div>
        </div>
      </section>

      <section className="search-dock container" aria-label="Tìm kiếm tour">
        <div className="search-intro">
          <span className="search-overline">BẮT ĐẦU HÀNH TRÌNH</span>
          <h2>Tìm một chuyến đi</h2>
        </div>
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
              <FaSearch aria-hidden="true" /> Tìm tour
            </button>
        </form>
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
            <span className="section-kicker">CHỌN NHỊP ĐIỆU CỦA BẠN</span>
            <h2 className="section-title">Mỗi người, một cách đi.</h2>
            <p className="section-subtitle">Từ ngày rong ruổi giữa thiên nhiên đến những kỳ nghỉ thật chậm.</p>
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
        <div className="features-heading">
          <span className="section-kicker">AN TÂM LÊN ĐƯỜNG</span>
          <h2>Chuyến đi vui bắt đầu từ lựa chọn rõ ràng.</h2>
        </div>
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaPlaneDeparture /></div>
            <h3>Nhiều lựa chọn</h3>
            <p>Xem các hành trình trong nước, quốc tế và nghỉ dưỡng tại một nơi.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaHandHoldingUsd /></div>
            <h3>Giá rõ ràng</h3>
            <p>Xem giá tour và số chỗ còn lại trước khi thêm vào giỏ hàng.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaShieldAlt /></div>
            <h3>Theo dõi đơn hàng</h3>
            <p>Đăng nhập để xem trạng thái và thông tin các đơn đã đặt.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaHeadset /></div>
            <h3>Thông tin liên hệ</h3>
            <p>Liên hệ đội ngũ hỗ trợ qua số điện thoại hoặc email ở cuối trang.</p>
          </div>
        </div>
      </section>

      <section className="featured-tours-section container">
        <div className="section-header">
          <div>
            <span className="section-kicker">ĐANG ĐƯỢC QUAN TÂM</span>
            <h2 className="section-title">Những hành trình đáng thử.</h2>
            <p className="section-subtitle">Xem lịch trình, giá và chỗ trống trước khi chọn.</p>
          </div>
          <Link to="/tours" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Tất cả hành trình <FaArrowRight />
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
