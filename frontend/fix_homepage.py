import os

homepage_jsx = '''
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFireAlt, FaRegCompass, FaQuoteLeft } from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './HomePage.css';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursRes, catsRes] = await Promise.all([
          tourApi.getAll(),
          categoryApi.getAll()
        ]);
        setTours(toursRes.data);
        setCategories(catsRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(/tours?keyword=\);
    } else {
      navigate('/tours');
    }
  };

  if (loading) return <LoadingSpinner />;

  // Lấy 6 tour nổi bật (giả sử là các tour đầu tiên)
  const featuredTours = tours.slice(0, 6);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">KHÁM PHÁ VIỆT NAM <br />CÙNG CHÚNG TÔI</h1>
          <p className="hero-subtitle">Trải nghiệm những chuyến đi đáng nhớ với dịch vụ đẳng cấp</p>
          
          <div className="search-widget-container">
            <form className="search-widget" onSubmit={handleSearch}>
              <div className="search-input-group">
                <FaMapMarkerAlt className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Bạn muốn đi đâu?" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-btn">
                <FaSearch className="mr-2" /> Tìm Kiếm
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section container">
        <div className="section-header">
          <h2><FaRegCompass className="mr-2 text-primary" /> Danh Mục Nổi Bật</h2>
          <p>Lựa chọn hành trình phù hợp với phong cách của bạn</p>
        </div>
        
        <div className="category-cards">
          {categories.map(cat => (
            <Link to={/tours?category=\} key={cat.id || cat.categoryId} className="category-card">
              <div className="category-img-wrapper">
                <img 
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'} 
                  alt={cat.name || cat.categoryName} 
                  className="category-img"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Category'; }}
                />
                <div className="category-overlay">
                  <h3>{cat.name || cat.categoryName}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tours */}
      <section className="featured-tours-section">
        <div className="container">
          <div className="section-header">
            <h2><FaFireAlt className="mr-2 text-danger" /> Tour Thịnh Hành</h2>
            <p>Những điểm đến được yêu thích nhất trong tháng</p>
          </div>
          
          <div className="tour-grid">
            {featuredTours.map(tour => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
          
          <div className="text-center mt-5">
            <Link to="/tours" className="btn-view-all">Xem Tất Cả Tour</Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper"><i className="fas fa-plane-departure"></i></div>
            <h3>Hành trình đa dạng</h3>
            <p>Hàng trăm điểm đến hấp dẫn trong và ngoài nước chờ bạn khám phá.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><i className="fas fa-hand-holding-usd"></i></div>
            <h3>Giá cả cạnh tranh</h3>
            <p>Cam kết mang đến mức giá tốt nhất cùng nhiều ưu đãi hấp dẫn.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><i className="fas fa-shield-alt"></i></div>
            <h3>Thanh toán an toàn</h3>
            <p>Hệ thống thanh toán bảo mật 100%, hỗ trợ đa dạng phương thức.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><i className="fas fa-headset"></i></div>
            <h3>Hỗ trợ 24/7</h3>
            <p>Đội ngũ tư vấn viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
'''

with open('src/pages/HomePage.jsx', 'w', encoding='utf-8') as f:
    f.write(homepage_jsx)

print("Created HomePage.jsx")
