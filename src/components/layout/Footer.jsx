import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCompass, 
  FaFacebookF, 
  FaInstagram, 
  FaYoutube, 
  FaChevronRight, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaEnvelope 
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const handleSubmitNewsletter = (e) => {
    e.preventDefault();
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <Link to="/" className="footer-logo">
            <FaCompass />
            <span>Du Lịch <span className="text-accent">Việt</span></span>
          </Link>
          <p className="footer-about">
            Nền tảng đặt tour du lịch uy tín hàng đầu Việt Nam. Đồng hành cùng bạn trên mọi hành trình khám phá vẻ đẹp đất nước và thế giới.
          </p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Điểm Đến Hấp Dẫn</h4>
          <ul className="footer-links">
            <li>
              <Link to="/tours?category=1">
                <FaChevronRight className="link-icon" /> Tour Trong Nước
              </Link>
            </li>
            <li>
              <Link to="/tours?category=2">
                <FaChevronRight className="link-icon" /> Tour Quốc Tế
              </Link>
            </li>
            <li>
              <Link to="/tours?category=3">
                <FaChevronRight className="link-icon" /> Tour Nghỉ Dưỡng
              </Link>
            </li>
            <li>
              <Link to="/wishlist">
                <FaChevronRight className="link-icon" /> Tour Đã Lưu
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Hỗ Trợ Khách Hàng</h4>
          <ul className="footer-links">
            <li>
              <Link to="/help">
                <FaChevronRight className="link-icon" /> Trung Tâm Trợ Giúp
              </Link>
            </li>
            <li>
              <Link to="/help">
                <FaChevronRight className="link-icon" /> Hướng Dẫn Đặt Tour
              </Link>
            </li>
            <li>
              <Link to="/help">
                <FaChevronRight className="link-icon" /> Chính Sách Hoàn Hủy
              </Link>
            </li>
            <li>
              <Link to="/help">
                <FaChevronRight className="link-icon" /> Điều Khoản & Quy Định
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Liên Hệ</h4>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
          </div>
          <div className="contact-item">
            <FaPhoneAlt className="contact-icon" />
            <span>Hotline: 1900 1234 (8:00 - 21:00)</span>
          </div>
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>hotro@dulichviet.vn</span>
          </div>
          <form className="newsletter-form" onSubmit={handleSubmitNewsletter}>
            <input 
              type="email" 
              placeholder="Nhập email nhận ưu đãi..." 
              className="newsletter-input"
              aria-label="Email nhận ưu đãi"
            />
            <button type="submit" className="newsletter-btn">Đăng ký</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Du Lịch Việt. Tất cả các quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
