import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMapPin, 
  FiCompass, 
  FiZap, 
  FiShoppingBag, 
  FiBookmark, 
  FiFileText, 
  FiShield, 
  FiX, 
  FiArrowRight,
  FiTrendingUp,
  FiTag
} from 'react-icons/fi';
import { realTourApi } from '../../api/realTourDataApi';
import { useAuth } from '../../context/AuthContext';
import './OmniSearchModal.css';

const QUICK_DESTINATIONS = [
  { name: 'Hạ Long', desc: 'Du thuyền vịnh di sản 5 sao' },
  { name: 'Phú Quốc', desc: 'Thiên đường biển đảo & cáp treo' },
  { name: 'Đà Nẵng', desc: 'Bà Nà Hills & Phố cổ Hội An' },
  { name: 'Sa Pa', desc: 'Đỉnh Fansipan & bản làng mộng mơ' },
  { name: 'Đà Lạt', desc: 'Cao nguyên hoa & săn mây Tà Xùa' },
  { name: 'Côn Đảo', desc: 'Hành trình tâm linh & biển hoang sơ' }
];

const PRICE_TIERS = [
  { label: 'Dưới 5 triệu', value: 'low', desc: 'Tour ngắn ngày, tiết kiệm' },
  { label: 'Từ 5 – 10 triệu', value: 'mid', desc: 'Kỳ nghỉ 3-4 ngày chuẩn mực' },
  { label: 'Trên 10 triệu', value: 'high', desc: 'Tour thượng hạng & bay quốc tế' }
];

const OmniSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [matchedTours, setMatchedTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search tours when query changes
  useEffect(() => {
    if (!query.trim()) {
      setMatchedTours([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await realTourApi.search(query.trim());
        setMatchedTours((res.data || []).slice(0, 5));
      } catch {
        setMatchedTours([]);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelectDestination = (destName) => {
    onClose();
    navigate(`/tours?search=${encodeURIComponent(destName)}`);
  };

  const handleSelectPrice = (tierValue) => {
    onClose();
    navigate(`/tours?price=${encodeURIComponent(tierValue)}`);
  };

  const handleSelectTour = (tourId) => {
    onClose();
    navigate(`/tours/${tourId}`);
  };

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <div className="omni-backdrop" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="omni-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="omni-search-bar">
          <FiSearch className="omni-search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="omni-input"
            placeholder="Tìm theo điểm đến, tên tour, chủ đề hoặc phím tắt... (VD: Phú Quốc, Hạ Long)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              type="button" 
              className="omni-clear-btn" 
              onClick={() => setQuery('')}
              aria-label="Xóa nội dung tìm kiếm"
            >
              <FiX size={16} />
            </button>
          )}
          <span className="omni-shortcut-badge">ESC</span>
        </div>

        {/* Results / Suggestions Container */}
        <div className="omni-body">
          {/* Real-time matched tours */}
          {query.trim() && (
            <div className="omni-section">
              <div className="omni-section-title">
                <FiCompass size={14} />
                <span>Tour Phù Hợp ({matchedTours.length})</span>
                {loading && <span className="omni-mini-spinner"></span>}
              </div>
              {matchedTours.length > 0 ? (
                <div className="omni-list">
                  {matchedTours.map((tour) => (
                    <div 
                      key={tour.id} 
                      className="omni-item omni-tour-item"
                      onClick={() => handleSelectTour(tour.id)}
                    >
                      <img 
                        src={tour.imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=600'} 
                        alt={tour.name} 
                        className="omni-tour-thumb"
                      />
                      <div className="omni-tour-info">
                        <strong className="omni-tour-name">{tour.name}</strong>
                        <div className="omni-tour-meta">
                          <span className="omni-tour-price">
                            {Number(tour.price).toLocaleString('vi-VN')}₫
                          </span>
                          <span className="omni-meta-sep">•</span>
                          <span>{tour.duration || 'Nhiều ngày'}</span>
                          {tour.departureLocation && (
                            <>
                              <span className="omni-meta-sep">•</span>
                              <span>Khởi hành: {tour.departureLocation}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <FiArrowRight size={16} className="omni-item-arrow" />
                    </div>
                  ))}
                </div>
              ) : !loading && (
                <div className="omni-empty">
                  Không tìm thấy tour trực tiếp khớp với "{query}". Thử bấm Enter để tìm kiếm toàn bộ trên trang danh sách.
                  <button 
                    type="button" 
                    className="omni-fallback-search-btn"
                    onClick={() => handleSelectDestination(query)}
                  >
                    Xem tất cả kết quả cho "{query}"
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Trending Destinations */}
          <div className="omni-section">
            <div className="omni-section-title">
              <FiTrendingUp size={14} />
              <span>Điểm Đến Hàng Đầu 2026</span>
            </div>
            <div className="omni-grid-destinations">
              {QUICK_DESTINATIONS.map((dest, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="omni-dest-card"
                  onClick={() => handleSelectDestination(dest.name)}
                >
                  <FiMapPin size={15} className="text-accent" />
                  <div>
                    <strong>{dest.name}</strong>
                    <small>{dest.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter by Budget */}
          <div className="omni-section">
            <div className="omni-section-title">
              <FiTag size={14} />
              <span>Lọc Nhanh Theo Ngân Sách</span>
            </div>
            <div className="omni-grid-prices">
              {PRICE_TIERS.map((tier, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="omni-price-card"
                  onClick={() => handleSelectPrice(tier.value)}
                >
                  <div className="omni-price-label">{tier.label}</div>
                  <div className="omni-price-desc">{tier.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platform Navigation Shortcuts */}
          <div className="omni-section">
            <div className="omni-section-title">
              <FiZap size={14} />
              <span>Lối Tắt Tiện Ích</span>
            </div>
            <div className="omni-shortcuts-row">
              <button 
                type="button" 
                className="omni-shortcut-btn"
                onClick={() => handleNavigate('/tours')}
              >
                <FiCompass size={14} />
                <span>Tất Cả 80+ Tour</span>
              </button>
              {user && (
                <>
                  <button 
                    type="button" 
                    className="omni-shortcut-btn"
                    onClick={() => handleNavigate('/cart')}
                  >
                    <FiShoppingBag size={14} />
                    <span>Giỏ Hàng</span>
                  </button>
                  <button 
                    type="button" 
                    className="omni-shortcut-btn"
                    onClick={() => handleNavigate('/my-orders')}
                  >
                    <FiFileText size={14} />
                    <span>Đơn Hàng & Vé Điện Tử</span>
                  </button>
                  <button 
                    type="button" 
                    className="omni-shortcut-btn"
                    onClick={() => handleNavigate('/wishlist')}
                  >
                    <FiBookmark size={14} />
                    <span>Tour Đã Lưu</span>
                  </button>
                </>
              )}
              {user?.role === 'ADMIN' && (
                <button 
                  type="button" 
                  className="omni-shortcut-btn omni-admin-btn"
                  onClick={() => handleNavigate('/admin')}
                >
                  <FiShield size={14} />
                  <span>Trang Quản Trị Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="omni-footer">
          <span className="omni-footer-hint">
            Dùng phím <kbd>↑</kbd> <kbd>↓</kbd> để di chuyển, <kbd>Enter</kbd> để chọn, <kbd>ESC</kbd> để đóng
          </span>
          <span className="omni-brand-tag">Du Lịch Việt 2026</span>
        </div>
      </div>
    </div>
  );
};

export default OmniSearchModal;
