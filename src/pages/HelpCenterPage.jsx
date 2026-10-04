import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaChevronDown, 
  FaChevronUp, 
  FaFileInvoiceDollar, 
  FaShieldAlt, 
  FaTag, 
  FaHeadset, 
  FaEnvelope, 
  FaPhoneAlt,
  FaMapMarkedAlt,
  FaArrowRight,
  FaQuestionCircle
} from 'react-icons/fa';
import './HelpCenterPage.css';

const popularTopics = [
  {
    id: 'refund',
    icon: <FaFileInvoiceDollar />,
    title: 'Chính sách hoàn tiền',
    description: 'Hướng dẫn chi tiết về các quy trình và điều kiện hoàn tiền khi hủy dịch vụ hoặc thay đổi lịch trình.',
    category: 'Thanh toán'
  },
  {
    id: 'safety',
    icon: <FaShieldAlt />,
    title: 'Thông tin an toàn',
    description: 'Cập nhật quy định an toàn dịch bệnh, bảo hiểm du lịch và bảo vệ sức khỏe khi tham gia chuyến đi.',
    category: 'Tổng quan'
  },
  {
    id: 'coupon',
    icon: <FaTag />,
    title: 'Sử dụng mã giảm giá',
    description: 'Cách nhập mã khuyến mãi và tối ưu hóa chi phí đặt tour của bạn trong bước xác nhận thanh toán.',
    category: 'Đặt chỗ'
  }
];

const faqData = [
  {
    id: 1,
    category: 'Tổng quan',
    question: 'Quy trình hoạt động như thế nào?',
    answer: 'Hệ thống kết nối trực tiếp bạn với các hành trình chất lượng cao. Bạn có thể dễ dàng tìm kiếm theo điểm đến, so sánh giá cả, xem chi tiết lịch trình và xác nhận đặt chỗ chỉ trong vài thao tác đơn giản.'
  },
  {
    id: 2,
    category: 'Tổng quan',
    question: 'Hướng dẫn bắt đầu với Du Lịch Việt?',
    answer: 'Chỉ cần tạo tài khoản hoặc đăng nhập, tìm kiếm tour mong muốn từ thanh công cụ tại trang chủ, chọn số lượng vé và bấm "Đặt Ngay" hoặc "Thêm vào giỏ hàng" để chuẩn bị cho hành trình của bạn.'
  },
  {
    id: 3,
    category: 'Tổng quan',
    question: 'Hệ thống có tương thích với nhiều loại thiết bị không?',
    answer: 'Website được thiết kế đáp ứng hoàn toàn (Responsive) trên mọi kích thước màn hình từ điện thoại di động, máy tính bảng đến máy tính để bàn với tốc độ tải trang nhanh và trải nghiệm mượt mà.'
  },
  {
    id: 4,
    category: 'Đặt chỗ',
    question: 'Tôi có thể hủy yêu cầu đặt tour không?',
    answer: 'Bạn hoàn toàn có thể tự hủy đơn đặt tour miễn phí khi đơn còn ở trạng thái "Chờ xử lý" (PENDING) trực tiếp tại trang Đơn hàng của tôi. Chỗ ngồi sẽ lập tức được hoàn trả lại cho hệ thống.'
  },
  {
    id: 5,
    category: 'Đặt chỗ',
    question: 'Khi nào số lượng chỗ còn lại của tour được cập nhật?',
    answer: 'Số lượng chỗ được kiểm tra tự động và khấu trừ ngay khi bạn gửi yêu cầu đặt tour thành công. Nếu một khách khác hủy đơn, số lượng chỗ sẽ được tự động cộng trả lại ngay lập tức.'
  },
  {
    id: 6,
    category: 'Thanh toán',
    question: 'Giá hiển thị có bao gồm toàn bộ thuế và phí chưa?',
    answer: 'Giá tour được niêm yết là giá trọn gói tiêu chuẩn theo lịch trình quy định (gồm khách sạn, ăn uống theo tour, xe tham quan và bảo hiểm du lịch cơ bản). Phí phát sinh cá nhân sẽ được thanh toán trực tiếp tại điểm đến.'
  },
  {
    id: 7,
    category: 'Tài khoản',
    question: 'Danh sách tour đã lưu (Wishlist) hoạt động như thế nào?',
    answer: 'Bằng cách bấm nút trái tim "Lưu tour" trên bất kỳ tour du lịch nào, tour sẽ được lưu vào danh sách yêu thích cá nhân của bạn để dễ dàng theo dõi và đặt vé bất kỳ khi nào bạn sẵn sàng.'
  }
];

const featuredDestinations = [
  {
    title: 'Thám hiểm vùng Tây Bắc',
    count: '12,780 lượt khám phá',
    image: 'https://images.unsplash.com/photo-1523592121529-f6dde35f079e?w=800&q=80',
    tag: 'Thiên nhiên hùng vĩ'
  },
  {
    title: 'Kỳ quan biển đảo Hạ Long',
    count: '9,310 lượt khám phá',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80',
    tag: 'Di sản thế giới'
  },
  {
    title: 'Nghỉ dưỡng biển Phú Quốc',
    count: '8,670 lượt khám phá',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    tag: 'Resort cao cấp'
  }
];

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [openFaqId, setOpenFaqId] = useState(1);

  const categories = ['Tất cả', 'Tổng quan', 'Đặt chỗ', 'Thanh toán', 'Tài khoản'];

  const filteredFaqs = useMemo(() => {
    return faqData.filter((item) => {
      const matchCat = selectedCategory === 'Tất cả' || item.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="help-center-page">
      {/* Hero Header */}
      <section className="help-hero">
        <div className="container help-hero-inner">
          <span className="help-kicker">Trung tâm hỗ trợ</span>
          <h1 className="help-title">Chúng tôi có thể giúp gì cho bạn?</h1>
          <p className="help-subtitle">
            Tìm câu trả lời nhanh chóng cho mọi thắc mắc về chuyến đi, đặt chỗ và chính sách ưu đãi.
          </p>
          
          <div className="help-search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Nhập câu hỏi hoặc từ khóa cần tìm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm trợ giúp"
            />
          </div>
        </div>
      </section>

      {/* Popular Topics Section (Figma: Section - Popular Topics) */}
      <section className="help-section popular-topics-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Chủ đề phổ biến</span>
            <h2 className="section-main-title">Câu hỏi thường gặp</h2>
            <p className="section-desc">Chọn chủ đề bạn quan tâm để xem hướng dẫn chi tiết</p>
          </div>

          <div className="popular-cards-grid">
            {popularTopics.map((topic) => (
              <div 
                key={topic.id} 
                className="popular-card"
                onClick={() => {
                  setSelectedCategory(topic.category);
                  const el = document.getElementById('faq-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="topic-icon-wrap">
                  {topic.icon}
                </div>
                <h3 className="topic-title">{topic.title}</h3>
                <p className="topic-desc">{topic.description}</p>
                <span className="topic-link">
                  Xem chi tiết <FaArrowRight />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section (Figma: FAQ Section - Thắc mắc chung) */}
      <section className="help-section faq-section" id="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Thắc mắc chung</span>
            <h2 className="section-main-title">Giải đáp thắc mắc</h2>
          </div>

          {/* Category Tabs */}
          <div className="faq-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion list */}
          <div className="faq-accordion-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id} className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question-btn"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="question-text">{faq.question}</span>
                      <span className="faq-toggle-icon">
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer-panel">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-faq-results">
                <FaQuestionCircle className="empty-icon" />
                <p>Không tìm thấy nội dung phù hợp với từ khóa của bạn.</p>
                <button type="button" className="btn btn-outline" onClick={() => { setSearchQuery(''); setSelectedCategory('Tất cả'); }}>
                  Xem tất cả câu hỏi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Explore Destinations Highlight (Figma: Điểm đến tuyệt vời) */}
      <section className="help-section destinations-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Điểm đến tuyệt vời</span>
            <h2 className="section-main-title">Khám phá các địa điểm nổi tiếng Việt Nam</h2>
          </div>

          <div className="destinations-grid">
            {featuredDestinations.map((dest, idx) => (
              <div key={idx} className="destination-card">
                <div className="dest-image-wrap">
                  <img src={dest.image} alt={dest.title} className="dest-image" loading="lazy" />
                  <span className="dest-tag">{dest.tag}</span>
                </div>
                <div className="dest-info">
                  <h4 className="dest-title">{dest.title}</h4>
                  <span className="dest-count">{dest.count}</span>
                  <Link to="/tours" className="dest-action-btn">
                    Khám phá tour <FaArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 24/7 Support Card (Figma: Hỗ trợ 24/7 - Hỗ trợ khách hàng) */}
      <section className="help-section support-banner-section">
        <div className="container">
          <div className="support-banner-card">
            <div className="support-banner-content">
              <span className="support-badge"><FaHeadset /> Hỗ trợ 24/7</span>
              <h2 className="support-heading">Trung tâm hỗ trợ trực tuyến toàn diện</h2>
              <p className="support-desc">
                Đội ngũ chăm sóc khách hàng của Du Lịch Việt luôn sẵn sàng giải đáp thắc mắc và hỗ trợ bạn trong suốt hành trình.
              </p>
              <div className="support-contacts">
                <div className="contact-chip">
                  <FaPhoneAlt className="chip-icon" />
                  <div>
                    <span className="chip-label">Tổng đài hỗ trợ</span>
                    <strong className="chip-value">1900 1234 (8:00 - 21:00)</strong>
                  </div>
                </div>
                <div className="contact-chip">
                  <FaEnvelope className="chip-icon" />
                  <div>
                    <span className="chip-label">Email hỗ trợ</span>
                    <strong className="chip-value">hotro@dulichviet.vn</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="support-banner-action">
              <Link to="/tours" className="btn btn-primary btn-support">
                Khám phá chuyến đi ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
