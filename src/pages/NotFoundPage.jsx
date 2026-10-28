import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaCompass, FaHeadset, FaArrowLeft, FaSearch } from 'react-icons/fa';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-glow"></div>
        <div className="not-found-card">
          <div className="not-found-badge">
            <span className="not-found-dot"></span>
            MÃ LỖI 404 · TRANG KHÔNG TỒN TẠI
          </div>

          <h1 className="not-found-code">404</h1>

          <h2 className="not-found-title">Lạc lối giữa những chuyến đi?</h2>
          <p className="not-found-desc">
            Trang bạn đang tìm kiếm có thể đã được đổi tên, chuyển dời hoặc không tồn tại trên hệ thống Du Lịch Việt. Đừng lo, những điểm đến tuyệt vời vẫn đang chờ bạn khám phá!
          </p>

          <div className="not-found-actions">
            <Link to="/" className="btn-not-found btn-primary-nf">
              <FaHome /> Về Trang Chủ
            </Link>
            <Link to="/tours" className="btn-not-found btn-secondary-nf">
              <FaCompass /> Khám Phá Tour
            </Link>
            <button type="button" onClick={() => navigate(-1)} className="btn-not-found btn-ghost-nf">
              <FaArrowLeft /> Quay Lại
            </button>
          </div>

          <div className="not-found-footer-tips">
            <div className="nf-tip-item">
              <FaSearch className="nf-tip-icon" />
              <span>Tìm kiếm hơn 80+ tour trong nước và quốc tế hấp dẫn</span>
            </div>
            <div className="nf-tip-item">
              <FaHeadset className="nf-tip-icon" />
              <span>Cần trợ giúp gấp? Hotline 24/7: <strong>1900 1177</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
