import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Về Chúng Tôi */}
        <div className="footer-section">
          <Link to="/" className="footer-logo">
            <FaPlane /> VietTour
          </Link>
          <p className="footer-about">
            Chúng tôi tự hào là nhà cung cấp dịch vụ du lịch hàng đầu tại Việt Nam, mang đến cho bạn những trải nghiệm khó quên trên mọi nẻo đường.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><FaFacebookF /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaYoutube /></a>
          </div>
        </div>

        {/* Khám Phá */}
        <div className="footer-section">
          <h3 className="footer-title">Khám Phá</h3>
          <ul className="footer-links">
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tours Trong Nước</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tours Quốc Tế</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Khuyến Mãi</Link></li>
            <li><Link to="/profile"><FaChevronRight className="link-icon"/> Góc Cẩm Nang</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tư Vấn Du Lịch</Link></li>
          </ul>
        </div>

        {/* Liên Hệ */}
        <div className="footer-section">
          <h3 className="footer-title">Liên Hệ</h3>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <span>Tầng 15, Tòa nhà Landmark 81, Vinhomes Central Park, Q.Bình Thạnh, TP.HCM</span>
          </div>
          <div className="contact-item">
            <FaPhoneAlt className="contact-icon" />
            <span>1900 123 456<br />(08:00 - 22:00 hàng ngày)</span>
          </div>
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>contact@viettour.com.vn</span>
          </div>
        </div>

        {/* Nhận bản tin */}
        <div className="footer-section">
          <h3 className="footer-title">Nhận bản tin</h3>
          <p className="footer-about">Dng k'y de nhn nh~ung u'u d~ai m'oi nh'at v c'ac chu'ong trinh Khuyến Mãi dc biet tu ch'ung t'oi.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email của bạn..." className="newsletter-input" required />
            <button type="submit" className="newsletter-btn">Gửi</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VietTour. Tất cả các quyền được bảo lưu. Thiết kế bởi Nhóm 5.</p>
      </div>
    </footer>
  );
};

export default Footer;