import React, { useState } from 'react';
import { 
  FaPaintBrush, FaLayerGroup, FaDesktop, FaMobileAlt, FaEye, 
  FaCode, FaCheck, FaInfoCircle, FaMapMarkerAlt, FaPlane, FaTimes,
  FaPassport, FaQrcode, FaGlobeAsia, FaShieldAlt, FaSuitcase, FaBuilding
} from 'react-icons/fa';
import './AdminDesignCanvas.css';

const REPLICA_COMPONENTS = [
  {
    id: 'comp-dual-filter',
    name: 'Dual Horizontal Filter Lanes',
    category: 'SEARCH & DISCOVERY',
    desc: 'Hệ thống bộ lọc 2 làn phân tách Nơi Khởi Hành và Chủ Đề với chip tương tác và dynamic facet counts.',
    tokens: ['--color-primary: #0284c7', '--bg-surface: #ffffff', '--radius-pill: 9999px']
  },
  {
    id: 'comp-bento-gallery',
    name: 'Bento Mosaic Gallery',
    category: 'MEDIA & VISUALS',
    desc: 'Layout ảnh lưới Bento bất đối xứng 5 ảnh, hỗ trợ tag 4K Video Preview và Lightbox toàn màn hình.',
    tokens: ['--font-serif: Playfair Display', '--glass-bg: rgba(255,255,255,0.85)', '--radius-xl: 20px']
  },
  {
    id: 'comp-cancel-stepper',
    name: 'Transparent Cancellation Stepper',
    category: 'ESCROW & CHECKOUT',
    desc: 'Bảng bậc thang hoàn hủy theo mốc thời gian minh bạch (>7 ngày 100%, 3-6 ngày 70%, <48h 30%).',
    tokens: ['--color-success: #10b981', '--color-warning: #f59e0b', '--color-danger: #ef4444']
  },
  {
    id: 'comp-ai-sentiment',
    name: 'AI Review Sentiment Dashboard',
    category: 'AI INTELLIGENCE',
    desc: 'Bộ 3 Bento Card tổng hợp cảm xúc khách hàng: Điểm khen ngợi hàng đầu, Lưu ý hành trình, Trải nghiệm bản địa.',
    tokens: ['--ai-gradient: linear-gradient(135deg, #0284c7, #8b5cf6)', '--shadow-subtle: 0 4px 16px rgba(0,0,0,0.05)']
  },
  {
    id: 'comp-passport-checker',
    name: 'AI Passport & Visa Clearance Bento',
    category: 'INTERNATIONAL DOMAIN',
    desc: 'Widget tương tác thẩm định hộ chiếu còn hạn trên 6 tháng tính từ ngày kết thúc chuyến đi chuẩn IATA.',
    tokens: ['--color-valid: #10b981', '--color-expired: #ef4444', '--border-subtle: 1px solid #e2e8f0']
  },
  {
    id: 'comp-eticket-card',
    name: 'Secure E-Ticket QR Boarding Pass',
    category: 'TICKETING & FULFILLMENT',
    desc: 'Thẻ vé điện tử định danh kèm mã QR bảo mật, số ghế, thông tin điểm tập trung Nhà ga T1/T2.',
    tokens: ['--bg-ticket: #ffffff', '--border-ticket: 1px dashed #cbd5e1', '--badge-bg: #0284c7']
  },
  {
    id: 'comp-outbound-pill',
    name: 'Outbound vs Domestic Badge System',
    category: 'DESIGN TOKENS',
    desc: 'Hệ thống Badge phân định hành trình Quốc Tế 5 sao vs Nội Địa chọn lọc với hướng dẫn ga sân bay T1/T2.',
    tokens: ['--badge-intl: #7c3aed', '--badge-dom: #0284c7', '--insurance-intl: Chubb 1 Tỷ VND']
  }
];

const AdminDesignCanvas = () => {
  const [selectedCompId, setSelectedCompId] = useState('comp-dual-filter');
  const [viewMode, setViewMode] = useState('DESKTOP'); // 'DESKTOP' or 'MOBILE'
  const [demoSelectedDep, setDemoSelectedDep] = useState('Hà Nội');
  const [demoSelectedCat, setDemoSelectedCat] = useState('Biển Đảo & Nghỉ Dưỡng');
  const [demoDepositOption, setDemoDepositOption] = useState('DEPOSIT');

  // Interactive state for Passport Checker demo
  const [demoPassportExpiry, setDemoPassportExpiry] = useState('2027-10-15');
  const [demoReturnDate, setDemoReturnDate] = useState('2026-12-01');

  // Interactive state for Domain pill demo
  const [demoDomainType, setDemoDomainType] = useState('INTERNATIONAL'); // 'INTERNATIONAL' or 'DOMESTIC'

  const selectedComp = REPLICA_COMPONENTS.find(c => c.id === selectedCompId) || REPLICA_COMPONENTS[0];

  // Calculate passport verdict
  const getPassportVerdict = () => {
    const exp = new Date(demoPassportExpiry);
    const ret = new Date(demoReturnDate);
    const sixMonthsLater = new Date(ret);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    if (exp < ret) {
      return { status: 'EXPIRED', color: '#ef4444', label: 'Đã hết hạn vào ngày đi', clearance: false };
    } else if (exp < sixMonthsLater) {
      return { status: 'NEAR_EXPIRY', color: '#f59e0b', label: 'Còn dưới 6 tháng (Không đủ chuẩn IATA)', clearance: false };
    }
    return { status: 'VALID', color: '#10b981', label: 'Hợp lệ > 6 tháng (Đủ điều kiện xuất cảnh)', clearance: true };
  };

  const passportVerdict = getPassportVerdict();

  return (
    <div className="admin-replica-canvas animate-fade-in">
      {/* Top Banner */}
      <div className="replica-header card-surface">
        <div>
          <div className="replica-badge">
            <FaPaintBrush /> REPLICA DESIGN SYSTEM CANVAS (GITHUB REPLICA)
          </div>
          <h2 className="replica-title">Sân Chơi Kiểm Thử Linh Hồn Giao Diện (In-App Prototyping)</h2>
          <p className="replica-subtitle">
            Lấy cảm hứng từ <strong>GitHub Replica</strong>. Trực tiếp tương tác và kiểm thử 7 Component lữ hành cao cấp Quiet Luxury, đảm bảo chuẩn mực nhận diện thương hiệu tuyệt đối.
          </p>
        </div>

        <div className="viewport-toggle-wrap">
          <button 
            type="button" 
            className={`viewport-btn ${viewMode === 'DESKTOP' ? 'active' : ''}`}
            onClick={() => setViewMode('DESKTOP')}
          >
            <FaDesktop /> Desktop View
          </button>
          <button 
            type="button" 
            className={`viewport-btn ${viewMode === 'MOBILE' ? 'active' : ''}`}
            onClick={() => setViewMode('MOBILE')}
          >
            <FaMobileAlt /> Mobile View
          </button>
        </div>
      </div>

      <div className="replica-main-layout">
        {/* Component Selector Sidebar */}
        <div className="replica-sidebar card-surface">
          <div className="sidebar-heading">
            <FaLayerGroup /> THƯ VIỆN COMPONENT OTA (7)
          </div>

          <div className="comp-nav-list">
            {REPLICA_COMPONENTS.map(comp => (
              <button
                key={comp.id}
                type="button"
                className={`comp-nav-item ${selectedCompId === comp.id ? 'active' : ''}`}
                onClick={() => setSelectedCompId(comp.id)}
              >
                <div className="comp-nav-cat">{comp.category}</div>
                <div className="comp-nav-name">{comp.name}</div>
              </button>
            ))}
          </div>

          <div className="replica-tokens-box mt-4">
            <div className="tokens-heading">Design Tokens Áp Dụng:</div>
            <ul className="tokens-list">
              {selectedComp.tokens.map((token, idx) => (
                <li key={idx}><code>{token}</code></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Live Interactive Sandbox Stage */}
        <div className="replica-stage-area card-surface">
          <div className="stage-topbar">
            <div>
              <span className="stage-comp-badge">{selectedComp.category}</span>
              <h3 className="stage-comp-title">{selectedComp.name}</h3>
              <p className="stage-comp-desc">{selectedComp.desc}</p>
            </div>
            <div className="stage-status-chip">
              <FaEye /> LIVE REACTIVE PREVIEW
            </div>
          </div>

          {/* Interactive Component Render Stage */}
          <div className={`canvas-viewport-frame ${viewMode === 'MOBILE' ? 'mobile-frame' : 'desktop-frame'}`}>
            {/* 1. DUAL FILTER LANES COMPONENT DEMO */}
            {selectedComp.id === 'comp-dual-filter' && (
              <div className="demo-dual-lanes-box">
                <div className="demo-lane">
                  <div className="demo-lane-header">
                    <span className="demo-lane-badge"><FaMapMarkerAlt className="text-accent" /> Nơi Khởi Hành:</span>
                    <span className="demo-lane-hint">Chọn điểm xuất phát</span>
                  </div>
                  <div className="demo-chips-row">
                    {['Tất cả', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'].map(city => (
                      <button
                        key={city}
                        type="button"
                        className={`demo-chip ${demoSelectedDep === city ? 'active' : ''}`}
                        onClick={() => setDemoSelectedDep(city)}
                      >
                        {city} {demoSelectedDep === city && <FaCheck className="chip-check" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="demo-divider" />

                <div className="demo-lane">
                  <div className="demo-lane-header">
                    <span className="demo-lane-badge"><FaPlane className="text-primary" /> Chủ Đề Hành Trình:</span>
                    <span className="demo-lane-hint">Phong cách du lịch</span>
                  </div>
                  <div className="demo-chips-row">
                    {['Biển Đảo & Nghỉ Dưỡng', 'Miền Bắc & Tây Bắc', 'Di Sản Miền Trung', 'Du Thuyền 5 Sao', 'Trekking Mạo Hiểm'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={`demo-chip ${demoSelectedCat === cat ? 'active' : ''}`}
                        onClick={() => setDemoSelectedCat(cat)}
                      >
                        {cat} {demoSelectedCat === cat && <FaCheck className="chip-check" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="demo-active-state-summary">
                  Đang lọc: <strong>{demoSelectedDep}</strong> • <strong>{demoSelectedCat}</strong>
                </div>
              </div>
            )}

            {/* 2. BENTO MOSAIC GALLERY COMPONENT DEMO */}
            {selectedComp.id === 'comp-bento-gallery' && (
              <div className="demo-bento-gallery-box">
                <div className="demo-bento-grid">
                  <div className="bento-cell cell-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1528127269322-539801943592?w=800')" }}>
                    <span className="bento-tag">Ảnh Chính 4K</span>
                  </div>
                  <div className="bento-cell" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800')" }}></div>
                  <div className="bento-cell" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800')" }}></div>
                  <div className="bento-cell" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800')" }}></div>
                  <div className="bento-cell cell-more">
                    <span>+12 ảnh thực tế</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CANCELLATION POLICY STEPPER DEMO */}
            {selectedComp.id === 'comp-cancel-stepper' && (
              <div className="demo-stepper-box">
                <div className="stepper-cards-grid">
                  <div className="stepper-card step-free">
                    <span className="step-time">Trước &gt; 7 ngày</span>
                    <strong className="step-percent">Hoàn 100%</strong>
                    <span className="step-desc">Miễn phí hủy hoàn toàn, hoàn trả 100% tiền cọc hoặc thanh toán.</span>
                  </div>
                  <div className="stepper-card step-partial">
                    <span className="step-time">Trước 3 – 6 ngày</span>
                    <strong className="step-percent">Hoàn 70%</strong>
                    <span className="step-desc">Phí phạt giữ chỗ 30%, nhận lại 70% tổng tiền tour.</span>
                  </div>
                  <div className="stepper-card step-penalty">
                    <span className="step-time">Dưới 48 giờ</span>
                    <strong className="step-percent">Hoàn 30%</strong>
                    <span className="step-desc">Phí điều hành dịch vụ 70%, bảo lưu quyền lợi tối đa cho khách.</span>
                  </div>
                </div>

                <div className="demo-deposit-toggle-row mt-4">
                  <span>Mô phỏng hình thức thanh toán:</span>
                  <div className="demo-plan-buttons">
                    <button
                      type="button"
                      className={`btn-plan-opt ${demoDepositOption === 'DEPOSIT' ? 'active' : ''}`}
                      onClick={() => setDemoDepositOption('DEPOSIT')}
                    >
                      Đặt cọc 30% giữ chỗ
                    </button>
                    <button
                      type="button"
                      className={`btn-plan-opt ${demoDepositOption === 'FULL' ? 'active' : ''}`}
                      onClick={() => setDemoDepositOption('FULL')}
                    >
                      Tất toán 100%
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. AI SENTIMENT DASHBOARD DEMO */}
            {selectedComp.id === 'comp-ai-sentiment' && (
              <div className="demo-sentiment-box">
                <div className="sentiment-cards-grid">
                  <div className="sentiment-card card-praises">
                    <span className="sentiment-badge praise">Điểm Đánh Giá Cao</span>
                    <h5>Chất lượng dịch vụ 5 sao</h5>
                    <p>Khách hàng đặc biệt khen ngợi đội ngũ hướng dẫn viên tận tâm, xe Limousine ghế ngả êm ái và bữa ăn đặc sản đầy đặn.</p>
                  </div>
                  <div className="sentiment-card card-advisories">
                    <span className="sentiment-badge note">Lưu Ý Hành Trình</span>
                    <h5>Chuẩn bị trang phục ấm</h5>
                    <p>Đỉnh núi ban đêm nhiệt độ hạ dưới 12°C. Nên mang theo áo khoác gió và giày đi bộ có độ bám tốt.</p>
                  </div>
                  <div className="sentiment-card card-experience">
                    <span className="sentiment-badge exp">Điểm Nhấn Bản Địa</span>
                    <h5>Trải nghiệm văn hóa độc bản</h5>
                    <p>87% du khách hài lòng tuyệt đối khi được trực tiếp trải nghiệm giã bánh giầy cùng đồng bào bản địa.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. AI PASSPORT & VISA CLEARANCE BENTO DEMO */}
            {selectedComp.id === 'comp-passport-checker' && (
              <div className="demo-passport-box" style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <FaPassport style={{ color: '#7c3aed', fontSize: '1.4rem' }} />
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Thẩm Định Thời Hạn Hộ Chiếu Xuất Cảnh Tự Động
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Ngày Hết Hạn Hộ Chiếu (Passport Expiry):
                    </label>
                    <input
                      type="date"
                      value={demoPassportExpiry}
                      onChange={(e) => setDemoPassportExpiry(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Ngày Kết Thúc Chuyến Đi (Return Date):
                    </label>
                    <input
                      type="date"
                      value={demoReturnDate}
                      onChange={(e) => setDemoReturnDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: '10px', background: '#ffffff', border: `2px solid ${passportVerdict.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <FaShieldAlt style={{ color: passportVerdict.color }} />
                    <strong style={{ color: passportVerdict.color, fontSize: '0.95rem' }}>
                      KẾT QUẢ: {passportVerdict.label}
                    </strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                    {passportVerdict.clearance
                      ? 'Hộ chiếu của quý khách đáp ứng hoàn hảo tiêu chuẩn IATA (hạn > 6 tháng tính từ ngày kết thúc hành trình). Đủ điều kiện làm thủ tục Visa và xuất cảnh quốc tế.'
                      : 'Hộ chiếu không đủ điều kiện theo quy định xuất nhập cảnh quốc tế. Du Lịch Việt khuyến nghị quý khách làm thủ tục cấp đổi hộ chiếu mẫu mới gắn chip tại Cục Quản lý Xuất nhập cảnh trước khi nộp visa.'}
                  </p>
                </div>
              </div>
            )}

            {/* 6. SECURE E-TICKET QR BOARDING PASS DEMO */}
            {selectedComp.id === 'comp-eticket-card' && (
              <div className="demo-eticket-box" style={{ maxWidth: '420px', margin: '0 auto', background: '#ffffff', border: '1.5px dashed #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, padding: '4px 10px', borderRadius: '9999px', background: '#e0f2fe', color: '#0369a1' }}>
                    E-TICKET VÉ ĐIỆN TỬ
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b', fontSize: '0.85rem' }}>
                    MÃ ĐƠN: #ORD-9842
                  </span>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Hạ Long - Du Thuyền 5 Sao Ambassador Cruise
                </h4>
                
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                  Khởi hành: <strong>15/11/2026</strong> • Đón: <strong>Hà Nội (Nhà ga T1)</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Hành khách:</div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>NGUYỄN VĂN AN</strong>
                    <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px' }}>Đã xác nhận 02 Chỗ</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <FaQrcode style={{ fontSize: '2.8rem', color: '#0f172a' }} />
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>Quét khi lên xe</div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. OUTBOUND VS DOMESTIC BADGE DEMO */}
            {selectedComp.id === 'comp-outbound-pill' && (
              <div className="demo-outbound-pill-box" style={{ background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setDemoDomainType('INTERNATIONAL')}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: demoDomainType === 'INTERNATIONAL' ? '#7c3aed' : '#e2e8f0',
                      color: demoDomainType === 'INTERNATIONAL' ? '#fff' : '#475569',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <FaGlobeAsia /> Tour Quốc Tế (Outbound)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoDomainType('DOMESTIC')}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', border: 'none',
                      background: demoDomainType === 'DOMESTIC' ? '#0284c7' : '#e2e8f0',
                      color: demoDomainType === 'DOMESTIC' ? '#fff' : '#475569',
                      fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <FaMapMarkerAlt /> Tour Trong Nước (Domestic)
                  </button>
                </div>

                {demoDomainType === 'INTERNATIONAL' ? (
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: '#f5f3ff', color: '#7c3aed', fontWeight: 800, fontSize: '0.8rem', marginBottom: '12px' }}>
                      <FaGlobeAsia /> HÀNH TRÌNH QUỐC TẾ 5 SAO
                    </div>
                    <h4 style={{ margin: '0 0 10px', color: '#0f172a' }}>Tokyo - Núi Phú Sĩ - Cố Đô Kyoto 6N5Đ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>✈️ <strong>Nhà ga Quốc Tế (T2)</strong> - Có mặt trước 3h</div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>🛡️ <strong>Bảo hiểm Chubb 1 Tỷ VND</strong> toàn cầu</div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>💳 <strong>Đặt cọc 50%</strong> (Bảo lãnh trượt Visa 100%)</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '9999px', background: '#f0f9ff', color: '#0284c7', fontWeight: 800, fontSize: '0.8rem', marginBottom: '12px' }}>
                      <FaMapMarkerAlt /> HÀNH TRÌNH NỘI ĐỊA CHỌN LỌC
                    </div>
                    <h4 style={{ margin: '0 0 10px', color: '#0f172a' }}>Đà Nẵng - Hội An - Cầu Vàng Bà Nà Hills 4N3Đ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>✈️ <strong>Nhà ga Quốc Nội (T1)</strong> - Có mặt trước 2h</div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>🛡️ <strong>Bảo hiểm Bảo Việt 100 Triệu VND</strong></div>
                      <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>💳 <strong>Đặt cọc 30%</strong> (Tất toán trước 7 ngày)</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignCanvas;
