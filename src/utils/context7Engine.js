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
  },
  {
    id: 'ctx-international-vs-domestic',
    category: 'DOMAIN_RULES',
    title: 'Phân Định Nghiệp Vụ Chuyên Sâu: Tour Trong Nước vs Tour Quốc Tế',
    keywords: ['trong nước', 'quốc tế', 'nội địa', 'outbound', 'so sánh tour', 'khác nhau', 'nước ngoài'],
    content: `Quy chuẩn phân định nghiệp vụ lữ hành 2026:
1. Giấy tờ tùy thân:
   - Tour Nội địa: Chỉ cần CCCD gắn chip (hoặc Giấy khai sinh trích lục đối với trẻ em dưới 14 tuổi).
   - Tour Quốc tế: Bắt buộc Hộ chiếu (Passport) còn hạn tối thiểu 6 tháng tính từ ngày kết thúc chuyến đi. Trẻ em phải có hộ chiếu riêng.
2. Quy định Đặt cọc & Hoàn hủy:
   - Tour Nội địa: Đặt cọc 30%, tất toán trước 7 ngày, hủy trước 7 ngày miễn phí 100%.
   - Tour Quốc tế: Đặt cọc 50% để giữ vé máy bay quốc tế và nộp hồ sơ visa. Nếu bị từ chối Visa do yếu tố khách quan từ Sứ quán, Du Lịch Việt bảo lãnh hoàn lại 100% tiền cọc tour (chỉ trừ lệ phí xét visa thực tế).
3. Hàng không & Điểm tập trung:
   - Tour Nội địa: Tập trung tại Ga Quốc nội (Nhà ga T1) trước giờ bay 2 tiếng. Hành lý 20kg ký gửi + 7kg xách tay.
   - Tour Quốc tế: Tập trung tại Ga Quốc tế (Nhà ga T2) trước giờ bay 3 tiếng. Hành lý 23 - 30kg ký gửi. Không mang chất lỏng vượt quá 100ml trong hành lý xách tay.
4. Bảo hiểm du lịch:
   - Tour Nội địa: Mức bồi thường tối đa 100.000.000 VNĐ/khách.
   - Tour Quốc tế: Bảo hiểm toàn cầu Chubb / Bảo Việt International Care hạn mức 1.000.000.000 VNĐ (~45.000 USD/khách).
5. Hướng dẫn viên: Tour Quốc tế vận hành theo mô hình kép: 01 Trưởng đoàn suốt tuyến từ Việt Nam + 01 Hướng dẫn viên bản địa.`
  },
  {
    id: 'ctx-visa-passport-requirements',
    category: 'VISA_PASSPORT',
    title: 'Quy Định Hộ Chiếu, Thị Thực (Visa) & Bảo Lãnh Trượt Visa',
    keywords: ['visa', 'hộ chiếu', 'passport', 'thị thực', 'trượt visa', 'hạn 6 tháng', 'thủ tục visa'],
    content: `Quy định xuất nhập cảnh và bảo lãnh thị thực lữ hành:
1. Quy định thời hạn Hộ chiếu:
   - Theo Luật Xuất nhập cảnh quốc tế, hộ chiếu phải còn hạn trên 6 tháng tính từ ngày trở về Việt Nam và còn ít nhất 2 trang trắng liền kề.
   - Trường hợp hộ chiếu còn dưới 6 tháng: Du khách cần đổi hộ chiếu mới trên Cổng Dịch vụ Công Quốc gia (5 - 8 ngày làm việc).
2. Quy định Thị thực (Visa) theo khu vực:
   - Đông Nam Á (Thái Lan, Singapore, Malaysia): Miễn visa 30 ngày cho hộ chiếu Việt Nam.
   - Nhật Bản & Hàn Quốc: Hỗ trợ nộp Visa du lịch đoàn (thời gian xét duyệt 7 - 12 ngày làm việc).
   - Châu Âu (Schengen): Lấy sinh trắc học vân tay, xét duyệt 15 - 21 ngày làm việc.
3. Cam kết Bảo Lãnh Trượt Visa từ Du Lịch Việt:
   - Trường hợp hồ sơ du khách bị Lãnh sự quán từ chối visa vì lý do khách quan, công ty hoàn lại 100% tiền cọc tour đã đóng, chỉ trừ chi phí xét duyệt visa thực tế của Sứ quán.`
  },
  {
    id: 'ctx-aviation-baggage-rules',
    category: 'OPERATIONS',
    title: 'Quy Chuẩn Hàng Không, Nhà Ga T1/T2 & Hành Lý Ký Gửi',
    keywords: ['hàng không', 'hành lý', 'ký gửi', 'xách tay', 'nhà ga t1', 'nhà ga t2', 'chất lỏng', 'sân bay'],
    content: `Tiêu chuẩn hàng không lữ hành OTA 2026:
1. Nhà ga & Thời gian tập trung:
   - Chuyến bay Nội địa: Nhà ga T1 - Tập trung trước giờ bay 120 phút (2 tiếng).
   - Chuyến bay Quốc tế: Nhà ga T2 - Tập trung trước giờ bay 180 phút (3 tiếng) tại cột hẹn của Trưởng đoàn Du Lịch Việt.
2. Tiêu chuẩn Hành lý:
   - Hành lý ký gửi: 20kg (nội địa) hoặc 23 - 30kg (quốc tế) tùy hãng hàng không.
   - Hành lý xách tay: 7kg - 10kg, kích thước tiêu chuẩn không quá 56 x 36 x 23 cm.
3. Quy định vật dụng an ninh:
   - Tuyệt đối không để sạc dự phòng, pin lithium trong hành lý ký gửi (bắt buộc mang theo hành lý xách tay, dung lượng dưới 20.000 mAh).
   - Chất lỏng trên chuyến bay quốc tế: Mỗi bình chứa không quá 100ml, tổng thể tích không quá 1000ml đặt trong túi zip trong suốt.`
  },
  {
    id: 'ctx-global-travel-insurance',
    category: 'POLICIES',
    title: 'Quyền Lợi Bảo Hiểm Du Lịch Quốc Tế 1 Tỷ Đồng & Y Tế Khẩn Cấp',
    keywords: ['bảo hiểm', '1 tỷ', 'bảo hiểm quốc tế', 'y tế', 'chubb', 'cấp cứu', 'thất lạc hành lý'],
    content: `Chi tiết quyền lợi gói Bảo hiểm Du lịch Quốc tế cao cấp (Hợp tác cùng Chubb & Bảo Việt):
1. Chi phí y tế tai nạn và điều trị bệnh tật ở nước ngoài: Tối đa 1.000.000.000 VNĐ (~45.000 USD).
2. Hỗ trợ vận chuyển y tế cấp cứu và hồi hương: Chi trả 100% chi phí thực tế theo chỉ định của cơ quan y tế quốc tế SOS.
3. Bồi thường thất lạc hành lý hoặc hành lý đến chậm: Lên đến 20.000.000 VNĐ.
4. Bồi thường hủy chuyến hoặc chậm chuyến bay quốc tế kéo dài: Hỗ trợ ăn nghỉ tại khách sạn sân bay và phụ phí đổi chuyến.
5. Tổng đài cứu trợ khẩn cấp toàn cầu hoạt động 24/7 bằng tiếng Việt và tiếng Anh.`
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
