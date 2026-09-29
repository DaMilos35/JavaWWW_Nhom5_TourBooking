import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSearch, FaRegCompass, FaPlaneDeparture, FaHandHoldingUsd, FaShieldAlt, FaHeadset, FaCalendarAlt, FaUserFriends, FaArrowRight } from 'react-icons/fa';
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
      navigate(`/tours?keyword=${encodeURIComponent(searchKeyword)}`);
    } else {
      navigate('/tours');
    }
  };

  if (loading) return <LoadingSpinner />;

  const featuredTours = tours.slice(0, 8);

  return (
    <div className="homepage">
      {/* Premium Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Khám Phá Thế Giới<br/>Theo Cách Của Bạn</h1>
          <p className="hero-subtitle">Hàng ngàn điểm đến tuyệt vời với trải nghiệm đẳng cấp đang chờ đón bạn.</p>
          
          <form className="search-widget-wrapper" onSubmit={handleSearch}>
            <div className="search-field">
              <FaMapMarkerAlt className="search-icon" />
              <div className="search-input-group">
                <span className="search-label">Điểm đến</span>
                <input 
                  type="text" 
                  placeholder="Bạn muốn đi đâu?" 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="search-field" style={{ flex: 0.8 }}>
              <FaCalendarAlt className="search-icon" />
              <div className="search-input-group">
                <span className="search-label">Ngày đi</span>
                <input type="text" placeholder="Thêm ngày" className="search-input" />
              </div>
            </div>

            <div className="search-field" style={{ flex: 0.8, borderRight: 'none' }}>
              <FaUserFriends className="search-icon" />
              <div className="search-input-group">
                <span className="search-label">Khách</span>
                <input type="text" placeholder="1 Khách, 1 Phòng" className="search-input" />
              </div>
            </div>

            <button type="submit" className="btn-search-massive">
              <FaSearch /> Tìm Kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Featured Categories (Traveloka Style) */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Điểm Đến Yêu Thích</h2>
            <p className="section-subtitle">Gợi ý những địa điểm không thể bỏ qua trong mùa này</p>
          </div>
        </div>
        
        <div className="category-cards">
          {categories.map(cat => (
            <Link to={`/tours?category=${cat.id || cat.categoryId}`} key={cat.id || cat.categoryId} className="category-card">
              <img 
                src={cat.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80'} 
                alt={cat.name || cat.categoryName} 
                className="category-img"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Category'; }}
              />
              <div className="category-overlay">
                <h3>{cat.name || cat.categoryName}</h3>
                <span className="category-count">Hơn 50+ Tours</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section container">
        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaPlaneDeparture /></div>
            <h3>Bay Mọi Nơi</h3>
            <p>Hàng ngàn chuyến bay và điểm đến với mạng lưới đối tác toàn cầu.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaHandHoldingUsd /></div>
            <h3>Giá Tốt Bất Ngờ</h3>
            <p>Luôn đảm bảo mức giá cạnh tranh nhất, không phí ẩn.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaShieldAlt /></div>
            <h3>Giao Dịch An Toàn</h3>
            <p>Mã hóa chuẩn quốc tế, bảo vệ thông tin cá nhân và thẻ của bạn tuyệt đối.</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon-wrapper"><FaHeadset /></div>
            <h3>Hỗ Trợ Chuyên Nghiệp</h3>
            <p>Đội ngũ CSKH tận tâm sẵn sàng hỗ trợ bạn 24/7 trong mọi tình huống.</p>
          </div>
        </div>
      </section>

      {/* Featured Tours List */}
      <section className="featured-tours-section container" style={{ marginBottom: '100px' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Tour Thịnh Hành</h2>
            <p className="section-subtitle">Khám phá các ưu đãi tốt nhất đang được săn đón</p>
          </div>
          <Link to="/tours" className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            Xem Tất Cả <FaArrowRight />
          </Link>
        </div>
        
        <div className="tour-grid">
          {featuredTours.map(tour => (
            <TourCard key={tour.id || tour.tourId} tour={tour} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
