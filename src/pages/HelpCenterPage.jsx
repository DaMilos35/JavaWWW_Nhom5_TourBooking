import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import './HelpCenterPage.css';

const articles = [
  {
    category: 'Đặt tour',
    question: 'Làm thế nào để đặt vé và giữ chỗ tour?',
    answer: 'Bạn chọn tour mong muốn, chọn số lượng hành khách rồi tiến hành Đặt ngay hoặc Thêm vào giỏ hàng. Tại trang Đặt tour, hệ thống hỗ trợ tự động điền (1-click autofill) hồ sơ tài khoản và đếm ngược giữ chỗ 15 phút an toàn.'
  },
  {
    category: 'Đặt tour',
    question: 'Chính sách ưu đãi dành cho đoàn hoặc doanh nghiệp B2B như thế nào?',
    answer: 'Hệ thống tự động kích hoạt mức chiết khấu 5% cho các đơn hàng từ 10 vé trở lên. Doanh nghiệp và đối tác B2B còn được nhận tài khoản định danh riêng và xuất hóa đơn điện tử hợp lệ.'
  },
  {
    category: 'Thanh toán',
    question: 'Hệ thống hỗ trợ những phương thức thanh toán trực tuyến nào?',
    answer: 'Hệ thống hỗ trợ 3 phương thức thanh toán chuẩn hóa: (1) Cổng thanh toán trực tuyến VNPay Sandbox (ATM, Visa, QR-Pay); (2) Quét mã VietQR động chuẩn Napas 24/7 với nội dung chuyển khoản tự động; (3) Tiền mặt tại văn phòng du lịch.'
  },
  {
    category: 'Đơn đặt',
    question: 'Chính sách đổi hủy tour và quy trình nhận tiền hoàn như thế nào?',
    answer: 'Chính sách hủy tour minh bạch chuẩn Traveloka: (1) Đơn chưa thanh toán: Hủy miễn phí 100%, ghế hoàn kho tức thì. (2) Đơn đã thanh toán: Hủy trước ≥ 7 ngày hoàn 100%; từ 3-6 ngày phí 30%; trong vòng 48h phí 70%. Quý khách chỉ cần điền STK ngân hàng trong mục Đơn hàng của tôi, Ban Quản Trị sẽ chuyển tiền hoàn qua VietQR đối soát.'
  },
  {
    category: 'Đơn đặt',
    question: 'Khi nào số chỗ khả dụng của tour được cập nhật và bảo vệ?',
    answer: 'Hệ thống sử dụng cơ chế Khóa bi quan (Pessimistic Locking) trong cơ sở dữ liệu MariaDB khi đặt vé để đảm bảo không bị trùng chỗ (overbooking). Khi đơn hàng hủy, số ghế tự động được hoàn trả ngay lập tức.'
  },
  {
    category: 'Tìm kiếm AI',
    question: 'Công nghệ AI Vector Database (Semantic Search) hoạt động như thế nào?',
    answer: 'Thay vì chỉ tìm từ khóa khớp chính xác, thanh tìm kiếm thông minh sử dụng thuật toán Vector Embeddings để phân tích ngữ nghĩa tự nhiên của bạn (ví dụ: "cần nơi yên bình ngắm biển cho gia đình có người lớn tuổi"), từ đó gợi ý các tour phù hợp nhất.'
  },
  {
    category: 'Thông tin tour',
    question: 'Lịch trình, tiêu chuẩn khách sạn và dịch vụ bao gồm xem ở đâu?',
    answer: 'Mỗi tour đều có trang chi tiết đầy đủ 8 trường dữ liệu: Lịch trình trực quan theo dòng thời gian (Timeline Itinerary), danh sách dịch vụ Bao gồm (Included) & Không bao gồm (Excluded), tiêu chuẩn khách sạn sao, phương tiện di chuyển và chính sách hoàn hủy.'
  },
  {
    category: 'Tài khoản',
    question: 'Tôi có thể xem vé điện tử và tải phiếu xác nhận ở đâu?',
    answer: 'Sau khi thanh toán thành công, bạn vào mục "Đơn Hàng Của Tôi", chọn "Xem Phiếu Xác Nhận Tour" để xem vé điện tử E-Ticket Traveloka style có mã QR và in phiếu xác nhận trực tiếp.'
  }
];

const categories = ['Tất cả', ...new Set(articles.map((article) => article.category))];

const HelpCenterPage = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [openQuestion, setOpenQuestion] = useState(articles[0].question);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    return articles.filter((article) => (
      (activeCategory === 'Tất cả' || article.category === activeCategory)
      && (!normalizedQuery || `${article.question} ${article.answer} ${article.category}`.toLocaleLowerCase('vi').includes(normalizedQuery))
    ));
  }, [activeCategory, query]);
  const expandedQuestion = filteredArticles.some((article) => article.question === openQuestion)
    ? openQuestion
    : filteredArticles[0]?.question;

  return (
    <section className="help-center-page">
      <div className="container">
        <header className="help-center-hero">
          <p className="help-center-eyebrow">Hỗ trợ khách hàng</p>
          <h1>Trung tâm trợ giúp</h1>
          <p>Tìm câu trả lời về đặt vé, thanh toán trực tuyến, chính sách hoàn hủy và công nghệ AI.</p>
          <label className="help-search">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Bạn cần tìm thông tin gì?"
              aria-label="Tìm kiếm câu hỏi"
            />
          </label>
        </header>

        <nav className="help-category-list" aria-label="Chủ đề trợ giúp">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'is-active' : ''}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        <section className="help-articles" aria-label="Câu hỏi thường gặp">
          {filteredArticles.length ? filteredArticles.map((article) => {
            const isOpen = expandedQuestion === article.question;
            return (
              <article className="help-article" key={article.question}>
                <button
                  type="button"
                  className="help-article-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : article.question)}
                >
                  <span className="help-badge">{article.category}</span>
                  <span className="help-question">{article.question}</span>
                  <FaChevronDown className={`help-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="help-answer">
                    <p>{article.answer}</p>
                  </div>
                )}
              </article>
            );
          }) : (
            <div className="help-empty">
              <p>Không tìm thấy câu trả lời phù hợp với từ khóa của bạn.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};

export default HelpCenterPage;
