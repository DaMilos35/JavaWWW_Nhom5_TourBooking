import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHeart, 
  FaHome, 
  FaChevronRight, 
  FaCompass, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaFire,
  FaShieldAlt,
  FaCheck,
  FaLock
} from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { tourApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import './WishlistPage.css';

const WishlistPage = () => {
  const { user } = useAuth();
  const { savedTours } = useWishlist();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [recommendedTours, setRecommendedTours] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  const tabs = ['Tất cả', 'Tour Trong Nước', 'Tour Quốc Tế', 'Tour Nghỉ Dưỡng'];

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommended(true);
      try {
        const res = await tourApi.getAll();
        setRecommendedTours((res.data || []).slice(0, 3));
      } catch {
        setRecommendedTours([]);
      } finally {
        setLoadingRecommended(false);
      }
    };
    fetchRecommendations();
  }, []);

  const filteredSavedTours = savedTours.filter((tour) => {
    if (activeTab === 'Tất cả') return true;
    const catName = tour.category?.name || tour.category?.categoryName || '';
    return catName.toLowerCase().includes(activeTab.toLowerCase());
  });

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Breadcrumb (Figma: Breadcrumb) */}
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
          <Link to="/"><FaHome /> Trang chủ</Link>
          <span className="separator"><FaChevronRight /></span>
          <span className="current">Danh sách yêu thích</span>
        </nav>

        {/* Header (Figma: h1.page-title Danh sách đặt chỗ) */}
        <div className="wishlist-header-section">
          <div>
            <span className="wishlist-kicker">Kế hoạch chuyến đi</span>
            <h1 className="wishlist-page-title">Danh sách đặt chỗ</h1>
            <p className="wishlist-page-subtitle">
              Bạn đã thêm <strong>{savedTours.length} mục</strong> vào danh sách yêu thích
            </p>
          </div>
          <Link to="/tours" className="btn btn-outline btn-explore-more">
            <FaCompass /> Khám phá thêm tour
          </Link>
        </div>

        {/* Tabs & Filter (Figma: Tabs & Filter) */}
        <div className="wishlist-tabs-bar">
          <div className="wishlist-tabs-list">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`wishlist-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Tours Grid */}
        {!user ? (
          <div className="wishlist-empty-state">
            <div className="empty-heart-circle" style={{ background: '#fef2f2', color: '#ff5722' }}>
              <FaLock />
            </div>
            <h2>Vui lòng đăng nhập để xem tour đã lưu</h2>
            <p>
              Bạn cần đăng nhập tài khoản cá nhân để lưu các hành trình yêu thích và đồng bộ dữ liệu an toàn trên mọi thiết bị.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" state={{ from: location }} className="btn btn-primary">
                Đăng Nhập Ngay
              </Link>
              <Link to="/register" className="btn btn-outline">
                Đăng Ký Tài Khoản
              </Link>
            </div>
          </div>
        ) : filteredSavedTours.length > 0 ? (
          <div className="wishlist-tours-grid">
            {filteredSavedTours.map((tour) => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="wishlist-empty-state">
            <div className="empty-heart-circle">
              <FaHeart />
            </div>
            <h2>Chưa có tour nào trong danh sách</h2>
            <p>
              Chọn nút “Lưu tour” trên các hành trình du lịch bạn yêu thích để dễ dàng theo dõi và lên kế hoạch đặt vé.
            </p>
            <Link to="/tours" className="btn btn-primary">
              <FaCompass /> Khám phá các tour nổi bật
            </Link>
          </div>
        )}

        {/* Recommendation Section (Figma: Có thể bạn cũng thích - Cùng bắt đầu một cuộc phiêu lưu mới) */}
        <section className="wishlist-recommendation-section">
          <div className="recommendation-header">
            <div>
              <span className="recommendation-kicker"><FaFire /> Gợi ý hấp dẫn</span>
              <h2 className="recommendation-title">Có thể bạn cũng thích</h2>
              <p className="recommendation-desc">Cùng bắt đầu một cuộc phiêu lưu mới với các hành trình được đánh giá cao nhất</p>
            </div>
            <Link to="/tours" className="btn btn-outline">Xem tất cả</Link>
          </div>

          <div className="recommendation-grid">
            {recommendedTours.map((tour) => (
              <TourCard key={tour.id || tour.tourId} tour={tour} />
            ))}
          </div>
        </section>

        {/* Category Features Highlight (Figma: Khám phá theo danh mục) */}
        <section className="category-features-section">
          <div className="recommendation-header">
            <div>
              <span className="recommendation-kicker">Đa dạng lựa chọn</span>
              <h2 className="recommendation-title">Khám phá theo danh mục</h2>
            </div>
          </div>

          <div className="category-cards-grid">
            <Link to="/tours?category=1" className="category-feature-card">
              <div className="cat-feature-img-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80" 
                  alt="Tour Trong Nước" 
                  className="cat-feature-img"
                  loading="lazy"
                />
              </div>
              <div className="cat-feature-body">
                <h3>Tour Trong Nước</h3>
                <p>Khám phá vẻ đẹp bất tận từ Bắc chí Nam của dải đất hình chữ S</p>
                <span className="cat-feature-link">5 tour đang mở bán →</span>
              </div>
            </Link>

            <Link to="/tours?category=2" className="category-feature-card">
              <div className="cat-feature-img-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" 
                  alt="Tour Quốc Tế" 
                  className="cat-feature-img"
                  loading="lazy"
                />
              </div>
              <div className="cat-feature-body">
                <h3>Tour Quốc Tế</h3>
                <p>Trải nghiệm văn hóa đặc sắc tại các thiên đường du lịch thế giới</p>
                <span className="cat-feature-link">3 tour đang mở bán →</span>
              </div>
            </Link>

            <Link to="/tours?category=3" className="category-feature-card">
              <div className="cat-feature-img-wrap">
                <img 
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80" 
                  alt="Tour Nghỉ Dưỡng" 
                  className="cat-feature-img"
                  loading="lazy"
                />
              </div>
              <div className="cat-feature-body">
                <h3>Tour Nghỉ Dưỡng</h3>
                <p>Thư thái tuyệt đối tại các khu nghỉ dưỡng và khách sạn 5 sao</p>
                <span className="cat-feature-link">2 tour đang mở bán →</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WishlistPage;
