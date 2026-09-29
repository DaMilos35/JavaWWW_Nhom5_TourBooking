import React from 'react';
import { Link } from 'react-router-dom';
import { FaCompass, FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronRight } from 'react-icons/fa';
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
            Chúng tôi tự hào là nền tảng đặt tour du lịch uy tín hàng đầu tại Việt Nam, mang đến cho bạn những trải nghiệm khám phá trọn vẹn và an tâm tuyệt đối trên mọi nẻo đường.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook" className="social-icon"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter" className="social-icon"><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className="social-icon"><FaInstagram /></a>
            <a href="#" aria-label="Youtube" className="social-icon"><FaYoutube /></a>
          </div>
        </div>

        {/* Khám Phá */}
        <div className="footer-section">
          <h3 className="footer-title">Khám Phá Tuyến Tour</h3>
          <ul className="footer-links">
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tour Trong Nước</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tour Quốc Tế</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tour Nghỉ Dưỡng 5 Sao</Link></li>
            <li><Link to="/tours"><FaChevronRight className="link-icon"/> Tour Khám Phá Tây Bắc</Link></li>
            <li><Link to="/my-orders"><FaChevronRight className="link-icon"/> Tra Cứu Đơn Hàng</Link></li>
          </ul>
        </div>

        {/* Liên Hệ */}
        <div className="footer-section">
          <h3 className="footer-title">Thông Tin Liên Hệ</h3>
          <div className="contact-item">
            <FaMapMarkerAlt className="contact-icon" />
            <span>Tầng 15, Tòa nhà Landmark 81, Vinhomes Central Park, Q.Bình Thạnh, TP.HCM</span>
          </div>
          <div className="contact-item">
            <FaPhoneAlt className="contact-icon" />
            <span>1900 123 456 (Hotline 24/7)</span>
          </div>
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>contact@dulichviet.vn</span>
          </div>
        </div>

        {/* Nhận bản tin */}
        <div className="footer-section">
          <h3 className="footer-title">Đăng Ký Nhận Ưu Đãi</h3>
          <p className="footer-about">
            Đăng ký để nhận những thông báo ưu đãi độc quyền, mã giảm giá vé tour và cẩm nang du lịch mới nhất.
          </p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận tin!'); }}>
            <input type="email" placeholder="Nhập địa chỉ email của bạn..." className="newsletter-input" required />
            <button type="submit" className="newsletter-btn">Đăng Ký</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Du Lịch Việt (TourBooking). Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
