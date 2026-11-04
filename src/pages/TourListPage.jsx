import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaRedo, FaTimes, FaBuilding, FaMapMarkerAlt, 
  FaClock, FaMoneyBillWave, FaHotel, FaPlane, FaStar, FaCompass, FaCheck,
  FaSlidersH, FaThLarge
} from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import { TourGridSkeleton } from '../components/common/TourCardSkeleton';
import { ALL_CERTIFIED_PROVIDERS } from '../utils/providerData';
import useScrollReveal from '../hooks/useScrollReveal';
import './TourListPage.css';

const DEPARTURE_OPTIONS = [
  { value: '', label: 'Tất cả điểm khởi hành', shortLabel: 'Tất cả', icon: '🧭' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh', shortLabel: 'TP. Hồ Chí Minh', icon: '🏙️' },
  { value: 'Hà Nội', label: 'Hà Nội', shortLabel: 'Hà Nội', icon: '🏛️' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng', shortLabel: 'Đà Nẵng', icon: '🌉' },
  { value: 'Quy Nhơn', label: 'Quy Nhơn', shortLabel: 'Quy Nhơn', icon: '🏖️' },
  { value: 'Quảng Bình', label: 'Quảng Bình', shortLabel: 'Quảng Bình', icon: '🏔️' },
  { value: 'Cần Thơ', label: 'Cần Thơ', shortLabel: 'Cần Thơ', icon: '🛶' }
];

const PRICE_TIERS = [
  { value: '', label: 'Mọi mức giá', desc: 'Tất cả các mức ngân sách' },
  { value: 'under_3m', label: 'Dưới 3 triệu VNĐ', desc: 'Tiết kiệm / Học sinh - sinh viên', minPrice: 0, maxPrice: 3000000 },
  { value: '3m_7m', label: 'Từ 3 - 7 triệu VNĐ', desc: 'Phổ thông / Gia đình', minPrice: 3000000, maxPrice: 7000000 },
  { value: '7m_15m', label: 'Từ 7 - 15 triệu VNĐ', desc: 'Cao cấp / Nghỉ dưỡng 4-5 sao', minPrice: 7000000, maxPrice: 15000000 },
  { value: '15m_30m', label: 'Từ 15 - 30 triệu VNĐ', desc: 'Quốc tế Đông Nam Á & Đông Bắc Á', minPrice: 15000000, maxPrice: 30000000 },
  { value: 'over_30m', label: 'Trên 30 triệu VNĐ', desc: 'Thượng lưu / Châu Âu, Úc, Mỹ', minPrice: 30000000, maxPrice: 999999999 }
];

const DURATION_OPTIONS = [
  { value: '', label: 'Mọi thời lượng', desc: 'Tất cả các độ dài hành trình' },
  { value: '1d', label: '1 Ngày (Trong ngày)', desc: 'Đi về trong ngày, city tour', minDuration: 1, maxDuration: 1 },
  { value: '2_3d', label: '2 - 3 Ngày (Cuối tuần)', desc: 'Nghỉ ngơi ngắn ngày cuối tuần', minDuration: 2, maxDuration: 3 },
  { value: '4_5d', label: '4 - 5 Ngày (Trọn vẹn)', desc: 'Khám phá sâu trọn vẹn điểm đến', minDuration: 4, maxDuration: 5 },
  { value: 'over_5d', label: 'Trên 5 Ngày (Dài ngày)', desc: 'Xuyên Việt & Chuyến đi nước ngoài', minDuration: 6, maxDuration: 30 }
];

const STAR_OPTIONS = [
  { value: '', label: 'Tất cả hạng sao' },
  { value: '3', label: 'Khách sạn từ 3 sao tiện nghi' },
  { value: '4', label: 'Khách sạn từ 4 sao chuẩn quốc tế' },
  { value: '5', label: 'Resort & Khách sạn 5 sao thượng lưu' }
];

const CATEGORY_EMOJIS = {
  1: '🏖️',
  2: '🌾',
  3: '🏯',
  4: '🌲',
  5: '🛶',
  6: '🚢',
  7: '🎒',
  8: '🌏'
};

const getCategoryEmoji = (name = '', id) => {
  if (id && CATEGORY_EMOJIS[id]) return CATEGORY_EMOJIS[id];
  const lower = name.toLowerCase();
  if (lower.includes('biển') || lower.includes('đảo')) return '🏖️';
  if (lower.includes('tây bắc') || lower.includes('miền bắc')) return '🌾';
  if (lower.includes('di sản') || lower.includes('miền trung')) return '🏯';
  if (lower.includes('đà lạt') || lower.includes('cao nguyên')) return '🌲';
  if (lower.includes('sông nước') || lower.includes('miền tây')) return '🛶';
  if (lower.includes('du thuyền') || lower.includes('hạ long')) return '🚢';
  if (lower.includes('trekking') || lower.includes('thám hiểm')) return '🎒';
  if (lower.includes('quốc tế')) return '🌏';
  return '✈️';
};

const TourListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  // Lấy các tham số từ URL
  const paramKeyword = searchParams.get('keyword') || '';
  const paramCategory = searchParams.get('category') || '';
  const paramProvider = searchParams.get('provider') || '';
  const paramDeparture = searchParams.get('departure') || '';
  const paramPrice = searchParams.get('price') || '';
  const paramDuration = searchParams.get('duration') || '';
  const paramStar = searchParams.get('star') || '';
  const paramSort = searchParams.get('sort') || 'bestseller';

  const [tours, setTours] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryLoadError, setCategoryLoadError] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Modal bộ lọc chuyên sâu riêng biệt
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('departure');

  // State các bộ lọc
  const [searchTerm, setSearchTerm] = useState(paramKeyword);
  const [selectedCategory, setSelectedCategory] = useState(paramCategory);
  const [selectedProvider, setSelectedProvider] = useState(paramProvider);
  const [selectedDeparture, setSelectedDeparture] = useState(paramDeparture);
  const [priceTier, setPriceTier] = useState(paramPrice);
  const [durationTier, setDurationTier] = useState(paramDuration);
  const [hotelStar, setHotelStar] = useState(paramStar);
  const [sortBy, setSortBy] = useState(paramSort);
  const [currentPage, setCurrentPage] = useState(1);
  const TOURS_PER_PAGE = 9;

  const searchDebounceTimer = useRef(null);

  // Kích hoạt scroll reveal
  useScrollReveal([tours.length, loading, selectedCategory, selectedProvider, priceTier]);

  useEffect(() => {
    const initData = async () => {
      fetchCategories();
      try {
        const res = await tourApi.getAll();
        if (res.data && Array.isArray(res.data)) {
          setAllTours(res.data);
        }
      } catch (err) {
        console.warn('Cannot load all tours for facets:', err);
      }
    };
    initData();
  }, []);

  // Đóng modal khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterModalOpen]);

  // Đồng bộ URL -> State khi URL thay đổi (Back / Forward)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('keyword') || '');
    setSelectedCategory(params.get('category') || '');
    setSelectedProvider(params.get('provider') || '');
    setSelectedDeparture(params.get('departure') || '');
    setPriceTier(params.get('price') || '');
    setDurationTier(params.get('duration') || '');
    setHotelStar(params.get('star') || '');
    setSortBy(params.get('sort') || 'bestseller');
  }, [location.search]);

  // Tải danh mục
  const fetchCategories = async () => {
    setCategoryLoadError(false);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data || []);
    } catch (error) {
      setCategoryLoadError(true);
    }
  };

  // Tải tour dựa trên Specification Filter của Spring Boot
  const fetchTours = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const filterParams = {
        keyword: searchTerm.trim() || undefined,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        providerId: selectedProvider ? Number(selectedProvider) : undefined,
        departureLocation: selectedDeparture || undefined,
        hotelStar: hotelStar ? Number(hotelStar) : undefined,
        sortBy: sortBy || 'bestseller',
        status: 'ACTIVE'
      };

      const priceObj = PRICE_TIERS.find(p => p.value === priceTier);
      if (priceObj && priceObj.value) {
        filterParams.minPrice = priceObj.minPrice;
        filterParams.maxPrice = priceObj.maxPrice;
      }

      const durObj = DURATION_OPTIONS.find(d => d.value === durationTier);
      if (durObj && durObj.value) {
        filterParams.minDuration = durObj.minDuration;
        filterParams.maxDuration = durObj.maxDuration;
      }

      const res = await tourApi.filter(filterParams);
      const fetchedTours = res.data || [];
      setTours(fetchedTours);

      if (allTours.length === 0 && fetchedTours.length > 0 && !searchTerm && !selectedCategory && !selectedDeparture && !priceTier && !selectedProvider) {
        setAllTours(fetchedTours);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tour theo Specification:', error);
      setTours([]);
      setLoadError('Chưa tải được danh sách tour. Kiểm tra kết nối máy chủ rồi thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedProvider, selectedDeparture, priceTier, durationTier, hotelStar, sortBy, allTours.length]);

  // Kích hoạt fetch mỗi khi filter thay đổi
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Reset trang về 1 khi bất kỳ điều kiện lọc nào thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedProvider, selectedDeparture, priceTier, durationTier, hotelStar, sortBy]);

  const totalPages = Math.max(1, Math.ceil(tours.length / TOURS_PER_PAGE));

  const paginatedTours = useMemo(() => {
    const startIndex = (currentPage - 1) * TOURS_PER_PAGE;
    return tours.slice(startIndex, startIndex + TOURS_PER_PAGE);
  }, [tours, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  // Dynamic Facet Counts (Bộ đếm số lượng tour thông minh theo thời gian thực)
  const departureCounts = useMemo(() => {
    const list = allTours.length > 0 ? allTours : tours;
    const counts = { '': list.length };
    DEPARTURE_OPTIONS.forEach(d => {
      if (!d.value) return;
      const lower = d.value.toLowerCase().trim();
      counts[d.value] = list.filter(t => (t.departureLocation || '').toLowerCase().includes(lower)).length;
    });
    return counts;
  }, [allTours, tours]);

  const categoryCounts = useMemo(() => {
    const list = allTours.length > 0 ? allTours : tours;
    const counts = { '': list.length };
    categories.forEach(c => {
      const cid = String(c.id || c.categoryId);
      counts[cid] = list.filter(t => Number(t.categoryId || t.category?.id) === Number(cid)).length;
    });
    return counts;
  }, [allTours, tours, categories]);

  const providerCounts = useMemo(() => {
    const list = allTours.length > 0 ? allTours : tours;
    const counts = { '': list.length };
    ALL_CERTIFIED_PROVIDERS.forEach(p => {
      counts[String(p.id)] = list.filter(t => Number(t.providerId) === Number(p.id)).length;
    });
    return counts;
  }, [allTours, tours]);

  // Danh mục được lọc theo ô tìm kiếm nhanh
  const filteredCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return categories;
    const q = categorySearchQuery.toLowerCase().trim();
    return categories.filter(c => (c.name || c.categoryName || '').toLowerCase().includes(q));
  }, [categories, categorySearchQuery]);

  // Cập nhật URLSearchParams
  const updateUrlParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const newQuery = params.toString();
    navigate(newQuery ? `/tours?${newQuery}` : '/tours', { replace: true });
  };

  // Xử lý debounce tìm kiếm
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    searchDebounceTimer.current = setTimeout(() => {
      updateUrlParam('keyword', value.trim());
    }, 400);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);
    updateUrlParam('keyword', searchTerm.trim());
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedProvider('');
    setSelectedDeparture('');
    setPriceTier('');
    setDurationTier('');
    setHotelStar('');
    setSortBy('bestseller');
    setCategorySearchQuery('');
    navigate('/tours');
  };

  // Tính số lượng bộ lọc đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDeparture) count++;
    if (selectedCategory) count++;
    if (priceTier) count++;
    if (durationTier) count++;
    if (selectedProvider) count++;
    if (hotelStar) count++;
    return count;
  }, [selectedDeparture, selectedCategory, priceTier, durationTier, selectedProvider, hotelStar]);

  const hasActiveFilters = Boolean(
    selectedCategory || selectedProvider || selectedDeparture || 
    priceTier || durationTier || hotelStar || searchTerm
  );

  // Tìm tên hiển thị của các active chips
  const selectedCategoryObj = categories.find(c => String(c.id || c.categoryId) === String(selectedCategory));
  const selectedProviderObj = ALL_CERTIFIED_PROVIDERS.find(p => String(p.id) === String(selectedProvider));
  const selectedPriceObj = PRICE_TIERS.find(p => p.value === priceTier);
  const selectedDurObj = DURATION_OPTIONS.find(d => d.value === durationTier);

  return (
    <div className="tour-list-page">
      <div className="container py-3">

        {/* ========================================================
            1. THANH TAB CHỦ ĐỀ HÀNH TRÌNH NGANG (AIRBNB / AGODA STYLE)
           ======================================================== */}
        <section className="top-category-tabs-bar" aria-label="Tab phân loại hành trình">
          <div className="category-tabs-scroll">
            <button
              type="button"
              className={`cat-tab-pill ${selectedCategory === '' ? 'is-active' : ''}`}
              onClick={() => {
                setSelectedCategory('');
                updateUrlParam('category', '');
              }}
            >
              <span className="cat-pill-icon">✨</span>
              <span className="cat-pill-text">Tất cả chủ đề</span>
              {allTours.length > 0 && <span className="cat-pill-badge">{allTours.length}</span>}
            </button>

            {categories.map(cat => {
              const catIdStr = String(cat.id || cat.categoryId);
              const count = categoryCounts[catIdStr] ?? 0;
              const isActive = String(selectedCategory) === catIdStr;
              const emoji = getCategoryEmoji(cat.name || cat.categoryName, cat.id || cat.categoryId);
              return (
                <button
                  key={catIdStr}
                  type="button"
                  className={`cat-tab-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(catIdStr);
                    updateUrlParam('category', catIdStr);
                  }}
                >
                  <span className="cat-pill-icon">{emoji}</span>
                  <span className="cat-pill-text">{cat.name || cat.categoryName}</span>
                  {count > 0 && <span className="cat-pill-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            2. THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC TINH GỌN (1 DÒNG DUY NHẤT)
           ======================================================== */}
        <section className="quick-filter-toolbar card-surface">
          {/* Ô tìm kiếm từ khóa */}
          <form onSubmit={handleSearchSubmit} className="toolbar-search-form">
            <div className="toolbar-search-wrap">
              <FaSearch className="toolbar-search-icon" />
              <input 
                type="search"
                className="toolbar-search-input" 
                aria-label="Tìm kiếm điểm đến hoặc tên tour"
                placeholder="Tìm điểm đến, tên tour, thành phố..." 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  className="btn-toolbar-clear" 
                  onClick={() => { setSearchTerm(''); updateUrlParam('keyword', ''); }}
                  title="Xóa từ khóa"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </form>

          {/* Các nút chọn nhanh thả xuống */}
          <div className="toolbar-quick-selects">
            {/* Điểm khởi hành */}
            <select
              className={`toolbar-select ${selectedDeparture ? 'has-value' : ''}`}
              aria-label="Chọn điểm khởi hành"
              value={selectedDeparture}
              onChange={(e) => {
                setSelectedDeparture(e.target.value);
                updateUrlParam('departure', e.target.value);
              }}
            >
              <option value="">📍 Khởi hành: Tất cả</option>
              {DEPARTURE_OPTIONS.filter(d => d.value).map(d => (
                <option key={d.value} value={d.value}>
                  📍 {d.label} ({departureCounts[d.value] || 0})
                </option>
              ))}
            </select>

            {/* Mức giá */}
            <select
              className={`toolbar-select ${priceTier ? 'has-value' : ''}`}
              aria-label="Chọn mức giá"
              value={priceTier}
              onChange={(e) => {
                setPriceTier(e.target.value);
                updateUrlParam('price', e.target.value);
              }}
            >
              <option value="">💰 Mức giá: Mọi mức giá</option>
              {PRICE_TIERS.filter(p => p.value).map(p => (
                <option key={p.value} value={p.value}>
                  💰 {p.label}
                </option>
              ))}
            </select>

            {/* Thời lượng */}
            <select
              className={`toolbar-select ${durationTier ? 'has-value' : ''}`}
              aria-label="Chọn thời lượng"
              value={durationTier}
              onChange={(e) => {
                setDurationTier(e.target.value);
                updateUrlParam('duration', e.target.value);
              }}
            >
              <option value="">⏱️ Thời lượng: Mọi ngày</option>
              {DURATION_OPTIONS.filter(d => d.value).map(d => (
                <option key={d.value} value={d.value}>
                  ⏱️ {d.label}
                </option>
              ))}
            </select>

            {/* Đơn vị tổ chức */}
            <select
              className={`toolbar-select ${selectedProvider ? 'has-value' : ''}`}
              aria-label="Chọn đơn vị tổ chức"
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value);
                updateUrlParam('provider', e.target.value);
              }}
            >
              <option value="">🏢 Nhà tổ chức: Tất cả</option>
              {ALL_CERTIFIED_PROVIDERS.map(p => (
                <option key={p.id} value={String(p.id)}>
                  🏢 {p.shortName} ({providerCounts[String(p.id)] || 0})
                </option>
              ))}
            </select>

            {/* Sắp xếp */}
            <select 
              className="toolbar-select sort-highlight" 
              aria-label="Sắp xếp danh sách tour"
              value={sortBy} 
              onChange={(e) => {
                setSortBy(e.target.value);
                updateUrlParam('sort', e.target.value);
              }}
            >
              <option value="bestseller">⚡ Sắp xếp: Phổ biến nhất</option>
              <option value="price_asc">💵 Giá: Thấp đến cao</option>
              <option value="price_desc">💎 Giá: Cao đến thấp</option>
              <option value="rating_desc">⭐ Đánh giá cao nhất</option>
              <option value="newest">🆕 Tour mới nhất</option>
              <option value="duration_asc">⏱️ Thời lượng ngắn nhất</option>
            </select>

            {/* Nút Mở Tab Bộ Lọc Chuyên Sâu */}
            <button
              type="button"
              className={`btn-open-filter-modal ${activeFilterCount > 0 ? 'is-filtering' : ''}`}
              onClick={() => setIsFilterModalOpen(true)}
              title="Mở tab lựa chọn tất cả bộ lọc nâng cao"
            >
              <FaSlidersH className="btn-filter-icon" />
              <span className="btn-filter-text">Tab Bộ Lọc Chuyên Sâu</span>
              {activeFilterCount > 0 && (
                <span className="modal-filter-counter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </section>

        {/* ========================================================
            3. DÒNG THỐNG KÊ KẾT QUẢ & CÁC CHIP BỘ LỌC ĐANG ÁP DỤNG
           ======================================================== */}
        <section className="filter-summary-row mt-3">
          <div className="result-count-label">
            Tìm thấy <strong>{tours.length}</strong> hành trình du lịch phù hợp
            {tours.length > TOURS_PER_PAGE && (
              <span className="page-slice-hint" style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>
                {' '}(Trang {currentPage}/{totalPages} · hiển thị {(currentPage - 1) * TOURS_PER_PAGE + 1} - {Math.min(currentPage * TOURS_PER_PAGE, tours.length)})
              </span>
            )}
          </div>

          <div className="active-filter-chips">
            {selectedDeparture && (
              <span className="filter-chip">
                <FaMapMarkerAlt style={{ fontSize: '0.75rem' }} />
                {selectedDeparture}
                <button type="button" onClick={() => { setSelectedDeparture(''); updateUrlParam('departure', ''); }} aria-label="Bỏ chọn điểm khởi hành"><FaTimes /></button>
              </span>
            )}
            {selectedCategoryObj && (
              <span className="filter-chip">
                <FaPlane style={{ fontSize: '0.75rem' }} />
                {selectedCategoryObj.name || selectedCategoryObj.categoryName}
                <button type="button" onClick={() => { setSelectedCategory(''); updateUrlParam('category', ''); }} aria-label="Bỏ chọn danh mục"><FaTimes /></button>
              </span>
            )}
            {selectedProviderObj && (
              <span className="filter-chip chip-provider" style={{ borderColor: `${selectedProviderObj.brandColor}66`, color: selectedProviderObj.brandColor, background: `${selectedProviderObj.brandColor}12` }}>
                <FaBuilding style={{ fontSize: '0.75rem' }} />
                {selectedProviderObj.shortName}
                <button type="button" onClick={() => { setSelectedProvider(''); updateUrlParam('provider', ''); }} aria-label="Bỏ chọn đơn vị"><FaTimes /></button>
              </span>
            )}
            {selectedPriceObj && selectedPriceObj.value && (
              <span className="filter-chip">
                <FaMoneyBillWave style={{ fontSize: '0.75rem' }} />
                {selectedPriceObj.label}
                <button type="button" onClick={() => { setPriceTier(''); updateUrlParam('price', ''); }} aria-label="Bỏ chọn giá"><FaTimes /></button>
              </span>
            )}
            {selectedDurObj && selectedDurObj.value && (
              <span className="filter-chip">
                <FaClock style={{ fontSize: '0.75rem' }} />
                {selectedDurObj.label.split('(')[0].trim()}
                <button type="button" onClick={() => { setDurationTier(''); updateUrlParam('duration', ''); }} aria-label="Bỏ chọn thời lượng"><FaTimes /></button>
              </span>
            )}
            {hotelStar && (
              <span className="filter-chip">
                <FaStar style={{ fontSize: '0.75rem' }} />
                Từ {hotelStar} sao
                <button type="button" onClick={() => { setHotelStar(''); updateUrlParam('star', ''); }} aria-label="Bỏ chọn sao khách sạn"><FaTimes /></button>
              </span>
            )}
            {searchTerm && (
              <span className="filter-chip">
                <FaSearch style={{ fontSize: '0.75rem' }} />
                "{searchTerm}"
                <button type="button" onClick={() => { setSearchTerm(''); updateUrlParam('keyword', ''); }} aria-label="Xóa từ khóa"><FaTimes /></button>
              </span>
            )}

            {hasActiveFilters && (
              <button 
                type="button" 
                className="btn-clear-all-chips"
                onClick={resetFilters}
                title="Xóa tất cả các điều kiện lọc"
              >
                <FaRedo style={{ fontSize: '0.72rem' }} /> Đặt lại tất cả
              </button>
            )}
          </div>
        </section>

        {/* ========================================================
            4. GRID DANH SÁCH TOUR TOÀN CHIỀU RỘNG (FULL-WIDTH 3 CỘT)
           ======================================================== */}
        <main className="main-content-full mt-3">
          {loadError && (
            <div className="empty-state card-surface load-error" role="alert">
              <p>{loadError}</p>
              <button type="button" className="btn btn-primary" onClick={fetchTours}>Thử lại</button>
            </div>
          )}

          {loading ? (
            <TourGridSkeleton count={6} />
          ) : loadError ? null : tours.length > 0 ? (
            <>
              <div className="tours-grid-list stagger-children">
                {paginatedTours.map(tour => (
                  <TourCard key={tour.id || tour.tourId} tour={tour} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="tour-pagination-wrapper" aria-label="Phân trang danh sách tour">
                  <div className="pagination-info">
                    Hiển thị <strong>{(currentPage - 1) * TOURS_PER_PAGE + 1} - {Math.min(currentPage * TOURS_PER_PAGE, tours.length)}</strong> trên tổng số <strong>{tours.length}</strong> hành trình
                  </div>
                  <div className="pagination-controls">
                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-label="Trang trước"
                    >
                      ‹ Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`btn-page-num ${page === currentPage ? 'is-active' : ''}`}
                        onClick={() => handlePageChange(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-label="Trang tiếp theo"
                    >
                      Sau ›
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state card-surface" style={{ borderRadius: '16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🧭</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Không tìm thấy tour phù hợp!</h3>
              <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                Không có hành trình nào khớp hoàn toàn với các tiêu chí lọc hiện tại. Vui lòng thử nới lỏng mức giá, điểm khởi hành hoặc nhà tổ chức.
              </p>
              <button className="btn btn-primary" onClick={resetFilters}>
                Xem tất cả 80+ hành trình
              </button>
            </div>
          )}
        </main>

        {/* ========================================================
            5. TAB RIÊNG ĐỂ CHỌN BỘ LỌC (DEDICATED TABBED FILTER MODAL)
           ======================================================== */}
        {isFilterModalOpen && (
          <div className="filter-modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
            <div className="filter-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="filter-modal-title">
              {/* Modal Header */}
              <div className="filter-modal-header">
                <div className="modal-header-left">
                  <div className="modal-header-icon-wrap">
                    <FaSlidersH />
                  </div>
                  <div>
                    <h3 id="filter-modal-title" className="modal-title">Tab Bộ Lọc Tìm Kiếm Chuyên Sâu</h3>
                    <p className="modal-subtitle">Tùy biến hành trình theo từng tiêu chí mà không làm kéo dài trang</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setIsFilterModalOpen(false)}
                  aria-label="Đóng bảng lọc"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body: Tabs bên trái, Nội dung bên phải */}
              <div className="filter-modal-body">
                {/* Thanh điều hướng Tab bên trái */}
                <div className="filter-tabs-nav" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeFilterTab === 'departure'}
                    className={`filter-nav-btn ${activeFilterTab === 'departure' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilterTab('departure')}
                  >
                    <span className="nav-btn-icon"><FaMapMarkerAlt /></span>
                    <span className="nav-btn-text">Điểm Khởi Hành</span>
                    {selectedDeparture && <span className="nav-active-dot" />}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeFilterTab === 'category'}
                    className={`filter-nav-btn ${activeFilterTab === 'category' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilterTab('category')}
                  >
                    <span className="nav-btn-icon"><FaPlane /></span>
                    <span className="nav-btn-text">Danh Mục & Chủ Đề</span>
                    {selectedCategory && <span className="nav-active-dot" />}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeFilterTab === 'price'}
                    className={`filter-nav-btn ${activeFilterTab === 'price' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilterTab('price')}
                  >
                    <span className="nav-btn-icon"><FaMoneyBillWave /></span>
                    <span className="nav-btn-text">Mức Giá Tour</span>
                    {priceTier && <span className="nav-active-dot" />}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeFilterTab === 'duration'}
                    className={`filter-nav-btn ${activeFilterTab === 'duration' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilterTab('duration')}
                  >
                    <span className="nav-btn-icon"><FaClock /></span>
                    <span className="nav-btn-text">Thời Lượng Tour</span>
                    {durationTier && <span className="nav-active-dot" />}
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeFilterTab === 'provider'}
                    className={`filter-nav-btn ${activeFilterTab === 'provider' ? 'is-active' : ''}`}
                    onClick={() => setActiveFilterTab('provider')}
                  >
                    <span className="nav-btn-icon"><FaBuilding /></span>
                    <span className="nav-btn-text">Đơn Vị & Hạng Sao</span>
                    {(selectedProvider || hotelStar) && <span className="nav-active-dot" />}
                  </button>
                </div>

                {/* Khung nội dung Tab bên phải */}
                <div className="filter-tab-content-panel">
                  {/* TAB 1: ĐIỂM KHỞI HÀNH */}
                  {activeFilterTab === 'departure' && (
                    <div className="tab-pane-content">
                      <div className="pane-header">
                        <h4>Chọn Điểm Khởi Hành</h4>
                        <p>Lọc các chuyến đi xuất phát gần thành phố của bạn</p>
                      </div>
                      <div className="options-grid-tiles">
                        {DEPARTURE_OPTIONS.map(d => {
                          const count = departureCounts[d.value] ?? 0;
                          const isChecked = selectedDeparture === d.value;
                          return (
                            <button
                              key={d.value}
                              type="button"
                              className={`filter-choice-tile ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setSelectedDeparture(d.value);
                                updateUrlParam('departure', d.value);
                              }}
                            >
                              <div className="tile-icon">{d.icon}</div>
                              <div className="tile-text">
                                <span className="tile-title">{d.label}</span>
                                {count > 0 && <span className="tile-count">{count} chuyến</span>}
                              </div>
                              {isChecked && <FaCheck className="tile-checked-icon" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DANH MỤC & CHỦ ĐỀ */}
                  {activeFilterTab === 'category' && (
                    <div className="tab-pane-content">
                      <div className="pane-header">
                        <h4>Chọn Phong Cách & Chủ Đề Du Lịch</h4>
                        <p>Trải nghiệm văn hóa, du thuyền, biển đảo hoặc khám phá thiên nhiên</p>
                      </div>

                      {categories.length > 5 && (
                        <div className="pane-quick-search mb-3">
                          <FaSearch className="quick-search-icon" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm nhanh chủ đề..."
                            value={categorySearchQuery}
                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                            className="pane-search-input"
                          />
                          {categorySearchQuery && (
                            <button type="button" className="btn-clear-search" onClick={() => setCategorySearchQuery('')}>
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      )}

                      <div className="options-grid-tiles">
                        <button
                          type="button"
                          className={`filter-choice-tile ${selectedCategory === '' ? 'is-active' : ''}`}
                          onClick={() => {
                            setSelectedCategory('');
                            updateUrlParam('category', '');
                          }}
                        >
                          <div className="tile-icon">✨</div>
                          <div className="tile-text">
                            <span className="tile-title">Tất cả danh mục</span>
                            {allTours.length > 0 && <span className="tile-count">{allTours.length} tour</span>}
                          </div>
                          {selectedCategory === '' && <FaCheck className="tile-checked-icon" />}
                        </button>

                        {filteredCategories.map(cat => {
                          const catIdStr = String(cat.id || cat.categoryId);
                          const count = categoryCounts[catIdStr] ?? 0;
                          const isChecked = String(selectedCategory) === catIdStr;
                          const emoji = getCategoryEmoji(cat.name || cat.categoryName, cat.id || cat.categoryId);
                          return (
                            <button
                              key={catIdStr}
                              type="button"
                              className={`filter-choice-tile ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setSelectedCategory(catIdStr);
                                updateUrlParam('category', catIdStr);
                              }}
                            >
                              <div className="tile-icon">{emoji}</div>
                              <div className="tile-text">
                                <span className="tile-title">{cat.name || cat.categoryName}</span>
                                {count > 0 && <span className="tile-count">{count} tour</span>}
                              </div>
                              {isChecked && <FaCheck className="tile-checked-icon" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MỨC GIÁ TOUR */}
                  {activeFilterTab === 'price' && (
                    <div className="tab-pane-content">
                      <div className="pane-header">
                        <h4>Chọn Mức Ngân Sách Phù Hợp</h4>
                        <p>Giá hiển thị đã bao gồm các dịch vụ trọn gói và bảo hiểm du lịch</p>
                      </div>
                      <div className="options-vertical-list">
                        {PRICE_TIERS.map(pt => {
                          const isChecked = priceTier === pt.value;
                          return (
                            <button
                              key={pt.value}
                              type="button"
                              className={`filter-list-row ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setPriceTier(pt.value);
                                updateUrlParam('price', pt.value);
                              }}
                            >
                              <div className="row-indicator">
                                <span className={`radio-dot ${isChecked ? 'checked' : ''}`} />
                              </div>
                              <div className="row-text">
                                <span className="row-title">{pt.label}</span>
                                <span className="row-desc">{pt.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: THỜI LƯỢNG TOUR */}
                  {activeFilterTab === 'duration' && (
                    <div className="tab-pane-content">
                      <div className="pane-header">
                        <h4>Chọn Thời Gian Chuyến Đi</h4>
                        <p>Từ những tour trong ngày chớp nhoáng đến kỳ nghỉ dưỡng dài ngày</p>
                      </div>
                      <div className="options-vertical-list">
                        {DURATION_OPTIONS.map(dur => {
                          const isChecked = durationTier === dur.value;
                          return (
                            <button
                              key={dur.value}
                              type="button"
                              className={`filter-list-row ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setDurationTier(dur.value);
                                updateUrlParam('duration', dur.value);
                              }}
                            >
                              <div className="row-indicator">
                                <span className={`radio-dot ${isChecked ? 'checked' : ''}`} />
                              </div>
                              <div className="row-text">
                                <span className="row-title">{dur.label}</span>
                                <span className="row-desc">{dur.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ĐƠN VỊ LỮ HÀNH & TIÊU CHUẨN KHÁCH SẠN */}
                  {activeFilterTab === 'provider' && (
                    <div className="tab-pane-content">
                      <div className="pane-header">
                        <h4>Chọn Nhà Cung Cấp Tour Uy Tín</h4>
                        <p>100% đối tác được kiểm duyệt giấy phép lữ hành quốc tế</p>
                      </div>

                      <div className="options-grid-tiles mb-4">
                        <button
                          type="button"
                          className={`filter-choice-tile ${selectedProvider === '' ? 'is-active' : ''}`}
                          onClick={() => {
                            setSelectedProvider('');
                            updateUrlParam('provider', '');
                          }}
                        >
                          <div className="tile-icon">🏛️</div>
                          <div className="tile-text">
                            <span className="tile-title">Tất cả nhà tổ chức</span>
                            {allTours.length > 0 && <span className="tile-count">{allTours.length} tour</span>}
                          </div>
                          {selectedProvider === '' && <FaCheck className="tile-checked-icon" />}
                        </button>

                        {ALL_CERTIFIED_PROVIDERS.map(p => {
                          const count = providerCounts[String(p.id)] ?? 0;
                          const isChecked = String(selectedProvider) === String(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`filter-choice-tile ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setSelectedProvider(String(p.id));
                                updateUrlParam('provider', String(p.id));
                              }}
                            >
                              <div className="tile-icon">🏢</div>
                              <div className="tile-text">
                                <span className="tile-title" style={{ color: p.brandColor, fontWeight: 700 }}>
                                  {p.shortName}
                                </span>
                                {count > 0 && <span className="tile-count">{count} tour</span>}
                              </div>
                              {isChecked && <FaCheck className="tile-checked-icon" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pane-header pt-3 border-top">
                        <h4>Hạng Sao Lưu Trú</h4>
                        <p>Tiêu chuẩn phòng khách sạn hoặc resort trong chương trình tour</p>
                      </div>
                      <div className="options-vertical-list">
                        {STAR_OPTIONS.map(st => {
                          const isChecked = hotelStar === st.value;
                          return (
                            <button
                              key={st.value}
                              type="button"
                              className={`filter-list-row ${isChecked ? 'is-active' : ''}`}
                              onClick={() => {
                                setHotelStar(st.value);
                                updateUrlParam('star', st.value);
                              }}
                            >
                              <div className="row-indicator">
                                <span className={`radio-dot ${isChecked ? 'checked' : ''}`} />
                              </div>
                              <div className="row-text">
                                <span className="row-title">{st.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer Bar */}
              <div className="filter-modal-footer">
                <button
                  type="button"
                  className="btn-modal-reset"
                  onClick={resetFilters}
                >
                  <FaRedo /> Đặt lại tất cả
                </button>
                <button
                  type="button"
                  className="btn-modal-apply"
                  onClick={() => setIsFilterModalOpen(false)}
                >
                  Xem {tours.length} hành trình (Áp dụng)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TourListPage;
