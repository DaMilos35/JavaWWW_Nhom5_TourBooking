import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUserFriends, FaStar, FaCheck, FaShoppingCart, FaBolt } from 'react-icons/fa';
import { tourApi } from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import './TourDetailPage.css';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await tourApi.getById(id);
        setTour(res.data);
      } catch (error) {
        toast.error('Không thể tải thông tin tour');
        navigate('/tours');
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, navigate]);

  const handleAddToCart = () => {
    addToCart(tour, quantity);
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    addToCart(tour, quantity);
    navigate('/cart');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!tour) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="tour-detail-page">
      <div className="container py-4">
        {/* Header */}
        <div className="td-header mb-4">
          <div className="breadcrumb">
            <span onClick={() => navigate('/')}>Trang chủ</span> {'>'} <span onClick={() => navigate('/tours')}>Tours</span> {'>'} <span className="active">{tour.name || tour.tourName}</span>
          </div>
          <h1 className="td-title">{tour.name || tour.tourName}</h1>
          <div className="td-meta">
            <span className="rating"><FaStar className="text-warning" /> {tour.rating || '4.9'}/5 Đánh giá</span>
            {tour.category && <span className="badge-cat">{tour.category.name || tour.category.categoryName}</span>}
            <span className="location"><FaMapMarkerAlt /> Khởi hành từ {tour.departureLocation}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="td-gallery mb-4">
          <img src={tour.imageUrl || 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'} alt={tour.name || tour.tourName} className="main-img" />
        </div>

        {/* Content Layout */}
        <div className="td-layout">
          {/* Left Column */}
          <div className="td-main">
            <div className="td-highlights mb-4">
              <div className="hl-item">
                <FaClock className="hl-icon" /> 
                <div className="hl-text"><span>Thời gian</span><b>{tour.duration || '3 Ngày 2 Đêm'}</b></div>
              </div>
              <div className="hl-item">
                <FaCalendarAlt className="hl-icon" /> 
                <div className="hl-text"><span>Khởi hành</span><b>Hàng ngày</b></div>
              </div>
              <div className="hl-item">
                <FaUserFriends className="hl-icon" /> 
                <div className="hl-text"><span>Chỗ trống</span><b>{tour.availableSeats || 10} chỗ</b></div>
              </div>
            </div>

            <div className="td-section">
              <h3>Điểm nhấn hành trình</h3>
              <div className="td-desc" dangerouslySetInnerHTML={{ __html: tour.description || '<p>Đang cập nhật mô tả chi tiết...</p>' }}></div>
            </div>

            <div className="td-section">
              <h3>Dịch vụ bao gồm</h3>
              <ul className="included-list">
                <li><FaCheck className="text-success" /> Xe đời mới máy lạnh đưa đón suốt tuyến</li>
                <li><FaCheck className="text-success" /> Khách sạn tiêu chuẩn (2-3 người/phòng)</li>
                <li><FaCheck className="text-success" /> Ăn uống theo chương trình</li>
                <li><FaCheck className="text-success" /> Hướng dẫn viên nhiệt tình, kinh nghiệm</li>
                <li><FaCheck className="text-success" /> Bảo hiểm du lịch lên đến 50.000.000đ</li>
              </ul>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="td-sidebar">
            <div className="booking-card">
              <div className="price-box">
                <span className="price">{formatPrice(tour.price)}</span>
                <span className="price-unit">/ khách</span>
              </div>
              
              <div className="quantity-box">
                <label>Số lượng khách</label>
                <div className="qty-controls">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                  <input type="number" value={quantity} readOnly />
                  <button onClick={() => setQuantity(q => Math.min(tour.availableSeats || 10, q + 1))}>+</button>
                </div>
              </div>

              <div className="total-box">
                <span>Tổng tiền:</span>
                <span className="total-price">{formatPrice(tour.price * quantity)}</span>
              </div>

              <div className="action-btns">
                <button className="btn btn-outline btn-full mb-3" onClick={handleAddToCart}>
                  <FaShoppingCart /> Thêm Giỏ Hàng
                </button>
                <button className="btn btn-primary btn-full" onClick={handleBuyNow}>
                  <FaBolt /> Đặt Ngay
                </button>
              </div>
              
              <div className="support-info mt-4">
                <p>Hỗ trợ tư vấn 24/7</p>
                <h4 className="text-accent">1900 1234</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
