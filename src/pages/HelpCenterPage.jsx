import React, { useMemo, useState } from 'react';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import './HelpCenterPage.css';

const articles = [
  {
    category: 'Đặt tour',
    question: 'Làm thế nào để gửi yêu cầu đặt tour?',
    answer: 'Chọn tour còn chỗ, thêm vào giỏ, đăng nhập rồi điền thông tin liên hệ ở bước gửi yêu cầu. Yêu cầu được tạo ở trạng thái chờ xử lý; nhân viên cần xác nhận trước khi thanh toán.'
  },
  {
    category: 'Đặt tour',
    question: 'Giá hiển thị có phải số tiền cuối cùng cần trả không?',
    answer: 'Đây là giá tour hiện lưu trong hệ thống và tổng tiền được máy chủ tính lại khi tạo yêu cầu. Các dịch vụ đi kèm hoặc phụ phí chưa được cấu hình riêng, vì vậy cần xác nhận trước khi thanh toán.'
  },
  {
    category: 'Thanh toán',
    question: 'Tôi có thể thanh toán bằng VietQR hoặc VNPAY trên website không?',
    answer: 'Chưa. Website chưa tích hợp cổng thanh toán và không xử lý giao dịch trực tuyến. Đừng chuyển tiền dựa trên thông tin chưa được nhân viên xác nhận.'
  },
  {
    category: 'Đơn đặt',
    question: 'Tôi có thể hủy yêu cầu đặt tour không?',
    answer: 'Bạn có thể hủy đơn đang ở trạng thái chờ xử lý trong mục Đơn hàng của tôi. Đơn đã xác nhận hoặc hoàn thành không thể hủy bằng chức năng hiện tại.'
  },
  {
    category: 'Đơn đặt',
    question: 'Khi nào chỗ tour được cập nhật?',
    answer: 'Số chỗ được kiểm tra và trừ khi máy chủ tạo đơn thành công. Nếu không đủ chỗ tại thời điểm gửi yêu cầu, hệ thống sẽ từ chối đơn và không trừ tồn chỗ.'
  },
  {
    category: 'Thông tin tour',
    question: 'Vì sao một số tour chưa có lịch trình, dịch vụ hoặc chính sách hủy?',
    answer: 'Hệ thống hiện chưa lưu các thông tin đó thành dữ liệu riêng cho từng tour. Trang chi tiết sẽ báo chưa cập nhật thay vì hiển thị nội dung chung không được xác minh.'
  },
  {
    category: 'Tài khoản',
    question: 'Danh sách tour đã lưu được lưu ở đâu?',
    answer: 'Danh sách được lưu cục bộ trên trình duyệt của thiết bị hiện tại, không đồng bộ giữa các thiết bị hoặc tài khoản.'
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
          <p className="help-center-eyebrow">Hỗ trợ đặt tour</p>
          <h1>Trung tâm trợ giúp</h1>
          <p>Tìm câu trả lời về cách gửi yêu cầu, lịch tour và trạng thái đơn.</p>
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
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? '' : article.question)}
                >
                  <span>
                    <small>{article.category}</small>
                    <strong>{article.question}</strong>
                  </span>
                  <FaChevronDown className={isOpen ? 'is-open' : ''} aria-hidden="true" />
                </button>
                {isOpen && <p>{article.answer}</p>}
              </article>
            );
          }) : (
            <div className="help-no-results">
              <h2>Không tìm thấy câu trả lời phù hợp</h2>
              <p>Thử từ khóa khác hoặc chọn “Tất cả” chủ đề.</p>
            </div>
          )}
        </section>

        <p className="help-contact-note">
          Kênh hỗ trợ trực tiếp chưa được cấu hình. Hãy ghi câu hỏi cần xác nhận trong phần ghi chú của yêu cầu đặt tour.
        </p>
      </div>
    </section>
  );
};

export default HelpCenterPage;
