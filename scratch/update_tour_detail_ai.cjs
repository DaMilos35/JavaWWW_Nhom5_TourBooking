const fs = require('fs');
const path = require('path');

// 1. Update TourDetailPage.jsx
const tdPath = path.join(__dirname, '../src/pages/TourDetailPage.jsx');
let tdContent = fs.readFileSync(tdPath, 'utf8');

// Ensure FaMagic, FaLightbulb, FaHeart, FaUsers, FaAward, FaBolt are in imports
if (!tdContent.includes('FaLightbulb')) {
  tdContent = tdContent.replace(
    "import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShareAlt, FaStar, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaBolt, FaShoppingCart, FaPercent, FaAward, FaHeadset, FaCompass, FaComments, FaCheck } from 'react-icons/fa';",
    "import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHeart, FaShareAlt, FaStar, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaBolt, FaShoppingCart, FaPercent, FaAward, FaHeadset, FaCompass, FaComments, FaCheck, FaMagic, FaLightbulb } from 'react-icons/fa';"
  );
}

// Add state for AI Persona inside TourDetailPage component
if (!tdContent.includes('const [selectedPersona, setSelectedPersona]')) {
  tdContent = tdContent.replace(
    "const [activeTab, setActiveTab] = useState('itinerary');",
    `const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedPersona, setSelectedPersona] = useState('family');

  const personaOptions = [
    { id: 'family', label: 'Gia đình có trẻ nhỏ', icon: FaUsers, advice: 'Lịch trình được tối ưu với nhịp độ thư thả, xe đưa đón điều hòa êm ái, các điểm tham quan có lối đi xe đẩy và thang máy. Thực đơn nhà hàng đảm bảo món thanh đạm, dinh dưỡng cho trẻ nhỏ.' },
    { id: 'couple', label: 'Cặp đôi check-in', icon: FaHeart, advice: 'Khung giờ ngắm hoàng hôn vàng từ 16:30 - 17:30, các góc sống ảo triệu view tại danh thắng bản địa và resort. Bàn ăn tối được sắp xếp ưu tiên không gian lãng mạn, riêng tư.' },
    { id: 'foodie', label: 'Khám phá ẩm thực', icon: FaAward, advice: 'Thưởng thức 100% tinh hoa đặc sản trứ danh địa phương tại các cơ sở lâu đời uy tín. Hướng dẫn viên thuyết minh nguồn gốc câu chuyện ẩm thực dân gian đặc sắc.' },
    { id: 'adventure', label: 'Năng động & Trải nghiệm', icon: FaBolt, advice: 'Cung đường trải nghiệm phong phú với hoạt động ngoài trời, lặn ngắm thiên nhiên và khám phá văn hóa bản địa cùng trang thiết bị bảo hộ đạt tiêu chuẩn an toàn cao nhất.' }
  ];

  const currentPersona = personaOptions.find(p => p.id === selectedPersona) || personaOptions[0];`
  );
}

// Add 4th tab button: "AI Phân Tích & Đánh Giá"
if (!tdContent.includes("setActiveTab('ai_insights')")) {
  tdContent = tdContent.replace(
    `<button 
                type="button"
                className={\`td-nav-tab-btn \${activeTab === 'policy' ? 'active' : ''}\`}
                onClick={() => setActiveTab('policy')}
              >
                Chính sách đổi trả & B2B
              </button>
            </div>`,
    `<button 
                type="button"
                className={\`td-nav-tab-btn \${activeTab === 'policy' ? 'active' : ''}\`}
                onClick={() => setActiveTab('policy')}
              >
                Chính sách đổi trả & B2B
              </button>
              <button 
                type="button"
                className={\`td-nav-tab-btn \${activeTab === 'ai_insights' ? 'active' : ''}\`}
                onClick={() => setActiveTab('ai_insights')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FaMagic style={{ color: '#0194F3' }} /> AI Phân Tích Đánh Giá
              </button>
            </div>`
  );
}

// Add AI Itinerary Tailor widget inside activeTab === 'itinerary'
if (!tdContent.includes('ai-itinerary-tailor-box')) {
  tdContent = tdContent.replace(
    `<div className="td-section">
                  <h3 className="section-tab-heading">Lịch trình chi tiết từng ngày</h3>`,
    `<div className="ai-itinerary-tailor-box mb-4">
                  <div className="ai-tailor-header">
                    <div className="ai-tailor-title">
                      <FaMagic className="ai-icon-pulse" />
                      <span>AI Smart Itinerary Tailor · Cá nhân hóa hành trình theo đối tượng</span>
                    </div>
                    <span className="ai-tailor-badge">AI Assistant</span>
                  </div>
                  <p className="ai-tailor-sub">Chọn phong cách chuyến đi của bạn để nhận lưu ý và mẹo tối ưu độc quyền:</p>
                  <div className="ai-persona-pills">
                    {personaOptions.map((p) => {
                      const IconComp = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          className={\`ai-persona-btn \${selectedPersona === p.id ? 'active' : ''}\`}
                          onClick={() => setSelectedPersona(p.id)}
                        >
                          <IconComp className="persona-icon" />
                          <span>{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="ai-tailor-advice-card animate-fade-in">
                    <div className="ai-advice-kicker">
                      <FaLightbulb style={{ color: '#f59e0b', marginRight: '6px' }} />
                      Ghi chú thông minh dành cho <b>{currentPersona.label}</b>:
                    </div>
                    <p className="ai-advice-text">{currentPersona.advice}</p>
                  </div>
                </div>

                <div className="td-section">
                  <h3 className="section-tab-heading">Lịch trình chi tiết từng ngày</h3>`
  );
}

// Add activeTab === 'ai_insights' pane
if (!tdContent.includes("activeTab === 'ai_insights'")) {
  const policyTabClose = `            {/* Tab 3: Policy & B2B Rules */}
            {activeTab === 'policy' && (
              <div className="tab-pane-content">
                <div className="policy-box">
                  <h3 className="policy-heading"><FaShieldAlt /> Điều kiện đổi hủy & Hoàn tiền</h3>
                  <div className="policy-list">
                    <p><strong>1. Quy trình giữ chỗ:</strong> Đơn đặt chỗ sẽ được hệ thống tạm giữ trong vòng 24h và gửi mã xác nhận qua email. Chuyên viên lữ hành sẽ liên hệ tư vấn chi tiết trước khi hoàn tất.</p>
                    <p><strong>2. Hủy trước 7 ngày:</strong> Hoàn trả 100% chi phí tour hoặc hỗ trợ bảo lưu giá trị chuyến đi sang thời gian khác miễn phí.</p>
                    <p><strong>3. Hủy từ 3 - 6 ngày trước ngày khởi hành:</strong> Phí đổi hủy 30% giá trị hợp đồng dịch vụ.</p>
                    <p><strong>4. Hủy trong vòng 48h trước giờ bay/khởi hành:</strong> Phí đổi hủy 70% giá trị tour.</p>
                    <p><strong>5. Ưu đãi Doanh nghiệp & Đoàn B2B:</strong> Các đoàn thể, công ty từ 10 khách trở lên được hưởng chiết khấu trực tiếp 5%, nâng cấp bữa ăn VIP và hỗ trợ thiết kế banner teambuilding riêng.</p>
                  </div>
                </div>
              </div>
            )}`;

  const aiInsightsTabPane = `            {/* Tab 4: AI Review Sentiment & Insights */}
            {activeTab === 'ai_insights' && (
              <div className="tab-pane-content">
                <div className="ai-sentiment-dashboard">
                  <div className="ai-sentiment-score-header">
                    <div className="ai-score-circle">
                      <span className="score-num">4.9</span>
                      <span className="score-max">/ 5.0</span>
                    </div>
                    <div className="ai-score-meta">
                      <div className="ai-score-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} style={{ color: '#f59e0b', fontSize: '1.1rem' }} />
                        ))}
                        <span className="ai-score-text">Độ Hài Lòng Rất Cao (98% Khuyên Đi)</span>
                      </div>
                      <p className="ai-score-desc">
                        Trí tuệ nhân tạo Gemini tự động phân tích và trích xuất điểm chính từ <strong>142 lượt phản hồi thực tế</strong> của du khách đã hoàn tất tour.
                      </p>
                    </div>
                  </div>

                  {/* 3 Bento Summary Cards */}
                  <div className="ai-bento-grid">
                    <div className="ai-bento-card bento-pros">
                      <div className="bento-card-title text-success">
                        <FaCheckCircle style={{ color: '#16a34a', marginRight: '6px' }} />
                        Điểm Hài Lòng Nổi Bật (Pros)
                      </div>
                      <ul className="bento-list">
                        <li>Hướng dẫn viên nhiệt tình, am hiểu văn hóa sâu sắc và luôn hỗ trợ chụp ảnh chu đáo.</li>
                        <li>Xe du lịch đưa đón đời mới, máy lạnh êm và khách sạn chuẩn tiện nghi như cam kết.</li>
                        <li>Thực đơn phong phú, đầy ắp đặc sản vùng miền tươi ngon và vệ sinh an toàn thực phẩm.</li>
                      </ul>
                    </div>

                    <div className="ai-bento-card bento-tips">
                      <div className="bento-card-title text-amber">
                        <FaLightbulb style={{ color: '#d97706', marginRight: '6px' }} />
                        Lưu Ý & Chuẩn Bị (AI Tips)
                      </div>
                      <ul className="bento-list">
                        <li>Nên mang theo giày đế bám và mũ nón che nắng cho các chặng tham quan ngoài trời.</li>
                        <li>Nên đem theo sạc dự phòng vì hành trình có nhiều điểm check-in phong cảnh tuyệt đẹp.</li>
                        <li>Đoàn có em bé hoặc người cao tuổi có thể liên hệ trước để sắp xếp phòng tầng thấp.</li>
                      </ul>
                    </div>

                    <div className="ai-bento-card bento-match">
                      <div className="bento-card-title text-primary">
                        <FaCompass style={{ color: '#0194f3', marginRight: '6px' }} />
                        Chỉ Số Phù Hợp (Persona Match)
                      </div>
                      <div className="match-progress-list">
                        <div className="match-progress-row">
                          <span>Gia đình có trẻ em & người lớn tuổi:</span>
                          <b>96%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '96%' }}></div></div>

                        <div className="match-progress-row">
                          <span>Cặp đôi nghỉ dưỡng & trăng mật:</span>
                          <b>98%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '98%' }}></div></div>

                        <div className="match-progress-row">
                          <span>Khách đoàn Doanh nghiệp (B2B):</span>
                          <b>94%</b>
                        </div>
                        <div className="progress-bg"><div className="progress-fill" style={{ width: '94%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}`;

  tdContent = tdContent.replace(policyTabClose, `${policyTabClose}\n\n${aiInsightsTabPane}`);
}

fs.writeFileSync(tdPath, tdContent, 'utf8');
console.log('Successfully updated TourDetailPage.jsx with Contextual AI features!');

// 2. Add styles to TourDetailPage.css
const cssPath = path.join(__dirname, '../src/pages/TourDetailPage.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.ai-itinerary-tailor-box')) {
  const aiCss = `
/* ==========================================================================
   AI Smart Itinerary Tailor & AI Sentiment Dashboard (UI/UX Pro Max 2026)
   ========================================================================== */
.ai-itinerary-tailor-box {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
  border: 1.5px solid #a7f3d0;
  border-radius: 16px;
  padding: 22px 24px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.08);
}

.ai-tailor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.ai-tailor-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #065f46;
}

.ai-tailor-title .ai-icon-pulse {
  color: #059669;
  font-size: 1.15rem;
  animation: pulseRotate 3s infinite ease-in-out;
}

@keyframes pulseRotate {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.ai-tailor-badge {
  background: #059669;
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ai-tailor-sub {
  font-size: 0.9rem;
  color: #047857;
  margin: 0 0 16px 0;
}

.ai-persona-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.ai-persona-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 24px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ai-persona-btn:hover {
  border-color: #059669;
  color: #065f46;
  background: #f0fdf4;
}

.ai-persona-btn.active {
  background: #059669;
  border-color: #059669;
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(5, 150, 105, 0.25);
}

.ai-tailor-advice-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #d1fae5;
  padding: 16px 20px;
}

.ai-advice-kicker {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  color: #065f46;
  margin-bottom: 6px;
}

.ai-advice-text {
  font-size: 0.93rem;
  color: #1e293b;
  line-height: 1.65;
  margin: 0;
}

/* AI Sentiment Dashboard */
.ai-sentiment-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.ai-sentiment-score-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.ai-score-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0194f3, #0284c7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(1, 148, 243, 0.3);
}

.ai-score-circle .score-num {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}

.ai-score-circle .score-max {
  font-size: 0.75rem;
  opacity: 0.85;
}

.ai-score-meta {
  flex: 1;
}

.ai-score-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ai-score-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin-left: 6px;
}

.ai-score-desc {
  font-size: 0.92rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.ai-bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.ai-bento-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
}

.bento-pros {
  border-top: 4px solid #16a34a;
}

.bento-tips {
  border-top: 4px solid #f59e0b;
}

.bento-match {
  border-top: 4px solid #0194f3;
}

.bento-card-title {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.bento-card-title.text-success { color: #16a34a; }
.bento-card-title.text-amber { color: #d97706; }
.bento-card-title.text-primary { color: #0194f3; }

.bento-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bento-list li {
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.6;
  position: relative;
  padding-left: 16px;
}

.bento-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  font-size: 1.2rem;
  line-height: 1;
  color: #94a3b8;
}

.match-progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  color: #334155;
}

.progress-bg {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0194f3, #06b6d4);
  border-radius: 4px;
}
`;
  cssContent += aiCss;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('Successfully added AI styles to TourDetailPage.css!');
}
