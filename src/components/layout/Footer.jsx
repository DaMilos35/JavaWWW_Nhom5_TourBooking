import React from 'react';
import { Link } from 'react-router-dom';
import { FaCompass, FaChevronRight } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Về Chúng Tôi */}
        <div className="footer-section">
          <Link to="/" className="footer-logo">
            <FaCompass style={{ color: '#0ea5e9' }} /> Du Lịch Việt
          </Link>
          <p className="footer-about">
            Tìm kiếm hành trình, xem thông tin tour và quản lý đơn đặt trực tuyến.
          </p>
        </div>

        {/* Khám Phá */}
        <div className="footer-section">
          <h3 className="footer-title">Khám Phá</h3>
          <ul className="footer-links">
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tất cả tour</Link></li>
            <li><Link to="/cart"><FaChevronRight className="link-icon"/> Giỏ hàng</Link></li>
            <li><Link to="/my-orders"><FaChevronRight className="link-icon"/> Đơn hàng của tôi</Link></li>
            <li><Link to="/help"><FaChevronRight className="link-icon"/> Trung tâm trợ giúp</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Trước khi đặt</h3>
          <p className="footer-about">
            Kênh hỗ trợ trực tiếp chưa được cấu hình. Hãy ghi câu hỏi cần xác nhận trong ghi chú của yêu cầu đặt tour.
          </p>
        </div>

        {/* Nhận bản tin */}
        <div className="footer-section">
          <h3 className="footer-title">Tìm hành trình phù hợp</h3>
          <p className="footer-about">
            Lọc tour theo danh mục và ngân sách để xem các lựa chọn đang mở bán.
          </p>
          <div className="newsletter-form">
            <Link to="/tours" className="newsletter-btn">Xem các tour</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Du Lịch Việt (TourBooking). Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
