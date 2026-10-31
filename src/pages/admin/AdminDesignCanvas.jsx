import React, { useState } from 'react';
import { 
  FaPaintBrush, FaLayerGroup, FaDesktop, FaMobileAlt, FaEye, 
  FaCode, FaCheck, FaInfoCircle, FaMapMarkerAlt, FaPlane, FaTimes
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
  }
];

const AdminDesignCanvas = () => {
  const [selectedCompId, setSelectedCompId] = useState('comp-dual-filter');
  const [viewMode, setViewMode] = useState('DESKTOP'); // 'DESKTOP' or 'MOBILE'
  const [demoSelectedDep, setDemoSelectedDep] = useState('Hà Nội');
  const [demoSelectedCat, setDemoSelectedCat] = useState('Biển Đảo & Nghỉ Dưỡng');
  const [demoDepositOption, setDemoDepositOption] = useState('DEPOSIT');

  const selectedComp = REPLICA_COMPONENTS.find(c => c.id === selectedCompId) || REPLICA_COMPONENTS[0];

  return (
    <div className="admin-replica-canvas animate-fade-in">
      {/* Top Banner */}
      <div className="replica-header card-surface">
        <div>
          <div className="replica-badge">
            <FaPaintBrush /> REPLICA DESIGN SYSTEM CANVAS
          </div>
          <h2 className="replica-title">Sân Chơi Kiểm Thử Linh Hồn Giao Diện (In-App Prototyping)</h2>
          <p className="replica-subtitle">
            Lấy cảm hứng từ <strong>GitHub Replica</strong>. Trực tiếp tương tác và kiểm thử các Component lữ hành cao cấp Quiet Luxury, đảm bảo chuẩn mực nhận diện thương hiệu tuyệt đối.
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
            <FaLayerGroup /> THƯ VIỆN COMPONENT OTA
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDesignCanvas;
