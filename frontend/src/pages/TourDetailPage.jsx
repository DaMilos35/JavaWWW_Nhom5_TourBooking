import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUserFriends, FaStar, FaCheck } from 'react-icons/fa';
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
    <div className="tour-detail-page bg-light">
      <div className="container py-4">
        {/* Header */}
        <div className="td-header mb-3">
          <div className="breadcrumb">
            <span>Trang chủ</span> {'>'} <span>Tours</span> {'>'} <span className="active">{tour.name}</span>
          </div>
          <h1 className="td-title">{tour.name}</h1>
          <div className="td-meta">
            <span className="rating"><FaStar color="#ffc107"/> {tour.rating || 5}/5</span>
            {tour.category && <span className="badge-cat">{tour.category.name}</span>}
            <span className="location"><FaMapMarkerAlt /> {tour.departureLocation}</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="td-gallery mb-4">
          <img src={tour.imageUrl || 'https://via.placeholder.com/1200x500'} alt={tour.name} className="main-img" />
        </div>

        {/* Content Layout */}
        <div className="td-layout">
          {/* Left Column */}
          <div className="td-main">
            <div className="td-highlights mb-4">
              <div className="hl-item"><FaClock /> <span>Thời gian:<br/><b>{tour.duration || '3 Ngày 2 Đêm'}</b></span></div>
              <div className="hl-item"><FaCalendarAlt /> <span>Khởi hành:<br/><b>Hàng ngày</b></span></div>
              <div className="hl-item"><FaUserFriends /> <span>Chỗ trống:<br/><b>{tour.availableSeats || 10} chỗ</b></span></div>
              <div className="hl-item"><FaMapMarkerAlt /> <span>Tập trung:<br/><b>{tour.departureLocation}</b></span></div>
            </div>

            <div className="td-section">
              <h3>Điểm nhấn hành trình</h3>
              <div className="td-desc" dangerouslySetInnerHTML={{ __html: tour.description || '<p>Đang cập nhật mô tả chi tiết...</p>' }}></div>
            </div>

            <div className="td-section">
              <h3>Dịch vụ bao gồm</h3>
              <ul className="included-list">
                <li><FaCheck color="green" /> Xe đời mới máy lạnh đưa đón suốt tuyến</li>
                <li><FaCheck color="green" /> Khách sạn tiêu chuẩn (2-3 người/phòng)</li>
                <li><FaCheck color="green" /> Ăn uống theo chương trình</li>
                <li><FaCheck color="green" /> Hướng dẫn viên nhiệt tình, kinh nghiệm</li>
                <li><FaCheck color="green" /> Bảo hiểm du lịch</li>
              </ul>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="td-sidebar">
            <div className="booking-card">
              <div className="price-box">
                <span className="price">{formatPrice(tour.price)}</span> / khách
              </div>
              
              <div className="quantity-box">
                <label>Số lượng khách:</label>
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
                <button className="btn btn-outline w-100 mb-2" onClick={handleAddToCart}>
                  Thêm vào giỏ hàng
                </button>
                <button className="btn btn-primary w-100" onClick={handleBuyNow}>
                  Đặt Ngay
                </button>
              </div>
              
              <div className="support-info mt-3 text-center">
                <p>Cần hỗ trợ? Gọi ngay</p>
                <h4 style={{color: 'var(--primary)'}}>1900 1234 5678</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
