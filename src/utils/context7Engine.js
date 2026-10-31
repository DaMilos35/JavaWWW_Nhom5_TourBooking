/**
 * Context7 Travel Grounding Engine
 * Inspired by Upstash Context7 (https://github.com/upstash/context7)
 * 
 * Provides ultra-fast in-memory semantic context caching and official OTA documentation grounding.
 * Prevents AI hallucinations by injecting verified policy clauses (Refund, Deposit, B2B, Child fare, Luggage)
 * directly into agent reasoning prompts and user inquiries.
 */

export const CONTEXT7_DOCS = [
  {
    id: 'ctx-cancellation-policy',
    category: 'POLICIES',
    title: 'Quy Định Hủy Tour & Hoàn Tiền Minh Bạch',
    keywords: ['hủy tour', 'hoàn tiền', 'refund', 'chính sách hủy', 'phí hủy', 'hủy vé'],
    content: `Chính sách hoàn tiền theo cấp bậc thời gian của Du Lịch Việt:
1. Hủy trước ngày khởi hành > 7 ngày: Hoàn 100% số tiền đã thanh toán (Miễn phí hủy hoàn toàn).
2. Hủy trước ngày khởi hành từ 3 đến 6 ngày: Hoàn 70% tổng giá trị tour (Phí phạt giữ chỗ 30%).
3. Hủy trước ngày khởi hành dưới 48 giờ (2 ngày): Hoàn 30% tổng chi phí dịch vụ (Phí điều hành dịch vụ đối tác 70%).
4. Hủy trong vòng 24 giờ trước giờ khởi hành hoặc vắng mặt (No-show): Không hoàn lại chi phí do toàn bộ dịch vụ khách sạn và phương tiện đã được đối tác xác nhận khóa chỗ.`
  },
  {
    id: 'ctx-deposit-preorder',
    category: 'POLICIES',
    title: 'Chính Sách Đặt Cọc Trước 30% Giữ Chỗ (Pre-order Deposit)',
    keywords: ['đặt cọc', 'cọc 30%', 'deposit', 'thanh toán đợt 1', 'đợt 2', 'trả trước'],
    content: `Chính sách đặt trước giữ chỗ:
1. Du khách chỉ cần thanh toán trước 30% tổng giá trị đơn hàng để xác nhận giữ chỗ thành công trên hệ thống.
2. Hệ thống phát hành ngay mã đặt chỗ kèm hợp đồng điện tử có chữ ký số.
3. Số tiền 70% còn lại (Đợt 2) cần được hoàn tất tất toán chậm nhất trước ngày khởi hành 7 ngày qua chuyển khoản hoặc cổng thanh toán trực tuyến.
4. Trường hợp không hoàn tất đợt 2 đúng thời hạn, hệ thống sẽ gửi 3 thông báo nhắc nhở qua Gmail và SMS trước khi áp dụng điều khoản hủy giữ chỗ.`
  },
  {
    id: 'ctx-b2b-corporate',
    category: 'B2B',
    title: 'Chính Sách Chiết Khấu Đoàn & Doanh Nghiệp (B2B)',
    keywords: ['b2b', 'doanh nghiệp', 'đoàn đông', 'chiết khấu', 'hóa đơn vat', 'công ty'],
    content: `Ưu đãi dành riêng cho khách hàng doanh nghiệp và khách đoàn MICE:
1. Đoàn từ 10 - 24 khách: Tự động áp dụng chiết khấu 10% tổng hóa đơn.
2. Đoàn từ 25 - 49 khách: Tự động áp dụng chiết khấu 15% tổng hóa đơn.
3. Đoàn từ 50 khách trở lên: Tự động áp dụng chiết khấu 20% cùng gói quà tặng thiết kế banner & teambuilding.
4. Hỗ trợ xuất hóa đơn điện tử VAT (GTGT) hợp lệ theo đúng mã số thuế doanh nghiệp ngay khi hoàn tất đơn hàng.`
  },
  {
    id: 'ctx-child-pricing',
    category: 'PRICING',
    title: 'Quy Định Giá Vé Trẻ Em & Em Bé',
    keywords: ['trẻ em', 'em bé', 'vé trẻ em', 'trẻ nhỏ', 'độ tuổi', 'phụ thu'],
    content: `Bảng quy chuẩn giá vé theo độ tuổi khách hàng:
1. Trẻ em dưới 2 tuổi: Miễn phí hoàn toàn giá tour mặt đất (chỉ phụ thu phí bảo hiểm và vé máy bay theo quy định hãng hàng không, tương đương 10% vé người lớn).
2. Trẻ em từ 2 đến dưới 11 tuổi: Tính 75% giá vé người lớn (đầy đủ suất ăn, ghế ngồi riêng trên xe, ngủ chung giường cùng bố mẹ).
3. Trẻ em từ 11 tuổi trở lên: Tính 100% giá vé người lớn (tiêu chuẩn dịch vụ và giường riêng như người lớn).`
  },
  {
    id: 'ctx-eticket-qr',
    category: 'OPERATIONS',
    title: 'Quy Trình Phát Hành Vé Điện Tử (E-Ticket) & Check-in QR',
    keywords: ['vé điện tử', 'e-ticket', 'mã qr', 'check-in', 'lên xe', 'xác nhận'],
    content: `Hệ thống vé điện tử thông minh:
1. Ngay khi thanh toán thành công (100% hoặc 30%), hệ thống tự động sinh mã QR E-Ticket độc bản và gửi vào hòm thư Gmail của khách hàng.
2. Du khách không cần in vé giấy; chỉ cần xuất trình mã QR trên điện thoại thông minh cho hướng dẫn viên hoặc nhân viên điều hành tại điểm đón.
3. Mã QR chứa dữ liệu đã mã hóa: Tên khách hàng, số lượng chỗ, trạng thái thanh toán và danh sách hành trình đính kèm.`
  },
  {
    id: 'ctx-partner-guarantee',
    category: 'OPERATIONS',
    title: 'Cam Kết Chất Lượng Đơn Vị Lữ Hành Chứng Nhận',
    keywords: ['đối tác', 'lữ hành', 'vietravel', 'saigontourist', 'du lịch việt', 'benthanh', 'hanoitourist', 'bestprice'],
    content: `Hệ thống 6 đơn vị lữ hành chính thức được kiểm định nghiêm ngặt:
1. Vietravel (GP-LHQT 79-042/2026): Đối tác chiến lược Kim Cương, bảo hiểm du lịch đến 100 triệu đồng.
2. Saigontourist (GP-LHQT 79-012/2026): Thương hiệu Quốc gia, chuyên tour nghỉ dưỡng cao cấp 4-5 sao.
3. Du Lịch Việt (GP-LHQT 79-052/2026): Đơn vị chủ quản nền tảng OTA, cam kết hoàn tiền và hỗ trợ trợ lý AI 24/7.
4. BenThanh Tourist (GP-LHQT 79-058/2026): Chuyên gia tour di sản miền Trung và sông nước miền Tây.
5. Hanoitourist (GP-LHQT 01-112/2026): Biểu tượng lữ hành Thủ đô, chuyên tour Tây Bắc & Đông Bắc mùa vàng.
6. BestPrice Travel (GP-LHQT 01-825/2026): Tiên phong du thuyền 5 sao Hạ Long & Lan Hạ với giá tốt nhất thị trường.`
  }
];

export const context7Engine = {
  /**
   * Truy vấn các điều khoản chính sách liên quan nhất dựa trên từ khóa hoặc câu hỏi của người dùng
   * @param {string} query Câu hỏi hoặc từ khóa người dùng
   * @param {number} topK Số lượng tài liệu liên quan tối đa trả về
   * @returns {Array} Danh sách tài liệu Context7 phù hợp
   */
  query: (query = '', topK = 2) => {
    if (!query || typeof query !== 'string') return [];
    const lower = query.toLowerCase().trim();
    
    // Tính điểm liên quan cho từng tài liệu
    const scoredDocs = CONTEXT7_DOCS.map(doc => {
      let score = 0;
      // Khớp từ khóa trực tiếp
      doc.keywords.forEach(kw => {
        if (lower.includes(kw.toLowerCase())) {
          score += 5;
        }
      });
      // Khớp từ khóa trong tiêu đề
      if (lower.includes(doc.title.toLowerCase())) {
        score += 8;
      }
      // Khớp một số từ ngữ trong nội dung
      const tokens = lower.split(/\s+/).filter(t => t.length > 2);
      tokens.forEach(tok => {
        if (doc.content.toLowerCase().includes(tok)) {
          score += 1;
        }
      });
      return { ...doc, score };
    });

    return scoredDocs
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  },

  /**
   * Tạo block prompt bọc context chuẩn mực cho LLM / Agent
   * @param {string} query 
   * @returns {string} Chuỗi context grounding
   */
  buildGroundingPrompt: (query = '') => {
    const relevantDocs = context7Engine.query(query, 2);
    if (relevantDocs.length === 0) return '';
    
    let groundingBlock = '\n[OFFICIAL OTA GROUNDING CONTEXT (Context7 Verified)]:\n';
    relevantDocs.forEach((doc, idx) => {
      groundingBlock += `--- Văn bản ${idx + 1}: ${doc.title} (${doc.category}) ---\n${doc.content}\n\n`;
    });
    groundingBlock += '[HƯỚNG DẪN TRẢ LỜI]: Hãy dựa trên văn bản chính thống trên để trả lời chính xác 100%, không suy đoán sai lệch chính sách hoàn hủy hay biểu phí.\n';
    return groundingBlock;
  },

  /**
   * Lấy toàn bộ danh mục tài liệu để hiển thị hoặc audit
   */
  getAllDocs: () => CONTEXT7_DOCS
};

export default context7Engine;
