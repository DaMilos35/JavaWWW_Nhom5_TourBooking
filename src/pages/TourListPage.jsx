import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaRedo, FaTimes, FaBuilding, FaMapMarkerAlt, 
  FaClock, FaMoneyBillWave, FaHotel, FaPlane, FaStar, FaCompass, FaCheck
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
  { value: 'Cần Thơ', label: 'Cần Thơ', shortLabel: 'Cần Thơ', icon: '🛶' }
];

const PRICE_TIERS = [
  { value: '', label: 'Mọi mức giá' },
  { value: 'under_3m', label: 'Dưới 3 triệu VNĐ (Tiết kiệm)', minPrice: 0, maxPrice: 3000000 },
  { value: '3m_7m', label: 'Từ 3 - 7 triệu VNĐ (Phổ thông)', minPrice: 3000000, maxPrice: 7000000 },
  { value: '7m_15m', label: 'Từ 7 - 15 triệu VNĐ (Cao cấp)', minPrice: 7000000, maxPrice: 15000000 },
  { value: '15m_30m', label: 'Từ 15 - 30 triệu VNĐ (Quốc tế)', minPrice: 15000000, maxPrice: 30000000 },
  { value: 'over_30m', label: 'Trên 30 triệu VNĐ (Thượng lưu)', minPrice: 30000000, maxPrice: 999999999 }
];

const DURATION_OPTIONS = [
  { value: '', label: 'Mọi thời lượng' },
  { value: '1d', label: '1 Ngày (Trong ngày)', minDuration: 1, maxDuration: 1 },
  { value: '2_3d', label: '2 - 3 Ngày (Cuối tuần)', minDuration: 2, maxDuration: 3 },
  { value: '4_5d', label: '4 - 5 Ngày (Trọn vẹn)', minDuration: 4, maxDuration: 5 },
  { value: 'over_5d', label: 'Trên 5 Ngày (Khám phá sâu)', minDuration: 6, maxDuration: 30 }
];

const STAR_OPTIONS = [
  { value: '', label: 'Tất cả hạng sao' },
  { value: '3', label: 'Khách sạn từ 3 sao' },
  { value: '4', label: 'Khách sạn từ 4 sao' },
  { value: '5', label: 'Resort & Khách sạn 5 sao cao cấp' }
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

  // State các bộ lọc
  const [searchTerm, setSearchTerm] = useState(paramKeyword);
  const [selectedCategory, setSelectedCategory] = useState(paramCategory);
  const [selectedProvider, setSelectedProvider] = useState(paramProvider);
  const [selectedDeparture, setSelectedDeparture] = useState(paramDeparture);
  const [priceTier, setPriceTier] = useState(paramPrice);
  const [durationTier, setDurationTier] = useState(paramDuration);
  const [hotelStar, setHotelStar] = useState(paramStar);
  const [sortBy, setSortBy] = useState(paramSort);

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
      // Map các filter options sang query params chuẩn Specification
      const filterParams = {
        keyword: searchTerm.trim() || undefined,
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        providerId: selectedProvider ? Number(selectedProvider) : undefined,
        departureLocation: selectedDeparture || undefined,
        hotelStar: hotelStar ? Number(hotelStar) : undefined,
        sortBy: sortBy || 'bestseller',
        status: 'ACTIVE'
      };

      // Xử lý khoảng giá
      const priceObj = PRICE_TIERS.find(p => p.value === priceTier);
      if (priceObj && priceObj.value) {
        filterParams.minPrice = priceObj.minPrice;
        filterParams.maxPrice = priceObj.maxPrice;
      }

      // Xử lý thời lượng
      const durObj = DURATION_OPTIONS.find(d => d.value === durationTier);
      if (durObj && durObj.value) {
        filterParams.minDuration = durObj.minDuration;
        filterParams.maxDuration = durObj.maxDuration;
      }

      const res = await tourApi.filter(filterParams);
      const fetchedTours = res.data || [];
      setTours(fetchedTours);

      // Lưu allTours nếu chưa có
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

  // Danh mục được lọc theo ô tìm kiếm nhanh trong sidebar
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

  // Kiểm tra có đang áp dụng bộ lọc nào không
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
      <div className="container py-4">
        <div className="layout-grid">
          {/* ========================================================
              SIDEBAR BỘ LỌC THÔNG MINH PHÂN LÀN (SMART SEGMENTED LANES)
             ======================================================== */}
          <aside className="sidebar">
            {/* Header Tổng Bộ Lọc */}
            <div className="filter-sidebar-header card-surface">
              <div className="header-left">
                <FaFilter className="header-filter-icon" />
                <h3 className="filter-title">BỘ LỌC TÌM KIẾM</h3>
              </div>
              {hasActiveFilters && (
                <button 
                  type="button" 
                  className="btn-quick-clear" 
                  onClick={resetFilters} 
                  title="Xóa tất cả các điều kiện lọc"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* LÀN 1: ĐIỂM KHỞI HÀNH (CARD LÀN RIÊNG BIỆT) */}
            <div className="filter-card filter-lane-card card-surface">
              <div className="filter-card-header">
                <h4 className="filter-group-heading">
                  <FaMapMarkerAlt className="filter-icon text-accent" /> Điểm Khởi Hành
                </h4>
                {selectedDeparture && (
                  <button 
                    type="button" 
                    className="btn-lane-reset" 
                    onClick={() => { setSelectedDeparture(''); updateUrlParam('departure', ''); }}
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="filter-options-list">
                {DEPARTURE_OPTIONS.map(d => {
                  const count = departureCounts[d.value] ?? 0;
                  const isChecked = selectedDeparture === d.value;
                  return (
                    <label 
                      key={d.value} 
                      className={`radio-label ${isChecked ? 'is-active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="departure"
                        value={d.value}
                        checked={isChecked}
                        onChange={() => {
                          setSelectedDeparture(d.value);
                          updateUrlParam('departure', d.value);
                        }}
                      />
                      <span className="radio-content-wrap">
                        <span className="radio-text">{d.label}</span>
                        {count > 0 && <span className="facet-badge">{count}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* LÀN 2: DANH MỤC & CHỦ ĐỀ TOUR (CARD LÀN RIÊNG BIỆT) */}
            <div className="filter-card filter-lane-card card-surface mt-3">
              <div className="filter-card-header">
                <h4 className="filter-group-heading">
                  <FaPlane className="filter-icon text-primary" /> Danh Mục Tour
                </h4>
                {selectedCategory && (
                  <button 
                    type="button" 
                    className="btn-lane-reset" 
                    onClick={() => { setSelectedCategory(''); updateUrlParam('category', ''); }}
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>

              {/* Ô tìm nhanh danh mục nếu danh sách dài */}
              {categories.length > 4 && (
                <div className="lane-quick-search">
                  <FaSearch className="quick-search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm nhanh danh mục..."
                    value={categorySearchQuery}
                    onChange={(e) => setCategorySearchQuery(e.target.value)}
                    className="quick-search-input"
                  />
                  {categorySearchQuery && (
                    <button type="button" className="btn-clear-search" onClick={() => setCategorySearchQuery('')}>
                      <FaTimes />
                    </button>
                  )}
                </div>
              )}

              <div className="filter-options-list">
                <label className={`radio-label ${selectedCategory === '' ? 'is-active' : ''}`}>
                  <input 
                    type="radio" 
                    name="category" 
                    value="" 
                    checked={selectedCategory === ''} 
                    onChange={() => {
                      setSelectedCategory('');
                      updateUrlParam('category', '');
                    }} 
                  />
                  <span className="radio-content-wrap">
                    <span className="radio-text">Tất cả danh mục ({categories.length})</span>
                    {allTours.length > 0 && <span className="facet-badge">{allTours.length}</span>}
                  </span>
                </label>

                {filteredCategories.map(cat => {
                  const catIdStr = String(cat.id || cat.categoryId);
                  const count = categoryCounts[catIdStr] ?? 0;
                  const isChecked = String(selectedCategory) === catIdStr;
                  const emoji = getCategoryEmoji(cat.name || cat.categoryName, cat.id || cat.categoryId);
                  return (
                    <label 
                      key={catIdStr} 
                      className={`radio-label ${isChecked ? 'is-active' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="category" 
                        value={catIdStr} 
                        checked={isChecked}
                        onChange={() => {
                          setSelectedCategory(catIdStr);
                          updateUrlParam('category', catIdStr);
                        }}
                      />
                      <span className="radio-content-wrap">
                        <span className="radio-text">
                          <span className="cat-bullet-emoji">{emoji}</span>
                          {cat.name || cat.categoryName}
                        </span>
                        {count > 0 && <span className="facet-badge">{count}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>

              {categoryLoadError && (
                <div className="filter-error" role="status">
                  <span>Chưa tải được danh mục tour.</span>
                  <button type="button" onClick={fetchCategories}>Thử lại</button>
                </div>
              )}
            </div>

            {/* LÀN 3: KHOẢNG GIÁ & THỜI LƯỢNG (CARD LÀN RIÊNG BIỆT) */}
            <div className="filter-card filter-lane-card card-surface mt-3">
              <div className="filter-card-header">
                <h4 className="filter-group-heading">
                  <FaMoneyBillWave className="filter-icon" /> Mức Giá Tour
                </h4>
                {priceTier && (
                  <button 
                    type="button" 
                    className="btn-lane-reset" 
                    onClick={() => { setPriceTier(''); updateUrlParam('price', ''); }}
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="filter-options-list">
                {PRICE_TIERS.map(pt => (
                  <label key={pt.value} className={`radio-label ${priceTier === pt.value ? 'is-active' : ''}`}>
                    <input
                      type="radio"
                      name="price"
                      value={pt.value}
                      checked={priceTier === pt.value}
                      onChange={() => {
                        setPriceTier(pt.value);
                        updateUrlParam('price', pt.value);
                      }}
                    />
                    <span className="radio-text">{pt.label}</span>
                  </label>
                ))}
              </div>

              {/* Thời Lượng Chuyến Đi */}
              <div className="filter-subgroup mt-4 pt-3 border-top">
                <div className="filter-card-header mb-2 p-0 border-0">
                  <h4 className="filter-group-heading">
                    <FaClock className="filter-icon" /> Thời Lượng Tour
                  </h4>
                  {durationTier && (
                    <button 
                      type="button" 
                      className="btn-lane-reset" 
                      onClick={() => { setDurationTier(''); updateUrlParam('duration', ''); }}
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="filter-options-list">
                  {DURATION_OPTIONS.map(dur => (
                    <label key={dur.value} className={`radio-label ${durationTier === dur.value ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="duration"
                        value={dur.value}
                        checked={durationTier === dur.value}
                        onChange={() => {
                          setDurationTier(dur.value);
                          updateUrlParam('duration', dur.value);
                        }}
                      />
                      <span className="radio-text">{dur.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* LÀN 4: ĐƠN VỊ TỔ CHỨC & HẠNG SAO (CARD LÀN RIÊNG BIỆT) */}
            <div className="filter-card filter-lane-card card-surface mt-3">
              <div className="filter-card-header">
                <h4 className="filter-group-heading">
                  <FaBuilding className="filter-icon text-accent" /> Đơn Vị Tổ Chức Tour
                </h4>
                {selectedProvider && (
                  <button 
                    type="button" 
                    className="btn-lane-reset" 
                    onClick={() => { setSelectedProvider(''); updateUrlParam('provider', ''); }}
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="filter-options-list">
                <label className={`radio-label ${selectedProvider === '' ? 'is-active' : ''}`}>
                  <input
                    type="radio"
                    name="provider"
                    value=""
                    checked={selectedProvider === ''}
                    onChange={() => {
                      setSelectedProvider('');
                      updateUrlParam('provider', '');
                    }}
                  />
                  <span className="radio-content-wrap">
                    <span className="radio-text">Tất cả đơn vị lữ hành</span>
                    {allTours.length > 0 && <span className="facet-badge">{allTours.length}</span>}
                  </span>
                </label>
                {ALL_CERTIFIED_PROVIDERS.map(p => {
                  const count = providerCounts[String(p.id)] ?? 0;
                  const isChecked = String(selectedProvider) === String(p.id);
                  return (
                    <label key={p.id} className={`radio-label ${isChecked ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="provider"
                        value={String(p.id)}
                        checked={isChecked}
                        onChange={() => {
                          setSelectedProvider(String(p.id));
                          updateUrlParam('provider', String(p.id));
                        }}
                      />
                      <span className="radio-content-wrap">
                        <span 
                          className="provider-filter-name" 
                          style={{ 
                            color: isChecked ? p.brandColor : 'inherit', 
                            fontWeight: isChecked ? 700 : 500 
                          }}
                        >
                          {p.shortName}
                        </span>
                        {count > 0 && <span className="facet-badge">{count}</span>}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Hạng Sao Khách Sạn */}
              <div className="filter-subgroup mt-4 pt-3 border-top">
                <div className="filter-card-header mb-2 p-0 border-0">
                  <h4 className="filter-group-heading">
                    <FaHotel className="filter-icon" /> Hạng Sao Khách Sạn
                  </h4>
                  {hotelStar && (
                    <button 
                      type="button" 
                      className="btn-lane-reset" 
                      onClick={() => { setHotelStar(''); updateUrlParam('star', ''); }}
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="filter-options-list">
                  {STAR_OPTIONS.map(st => (
                    <label key={st.value} className={`radio-label ${hotelStar === st.value ? 'is-active' : ''}`}>
                      <input
                        type="radio"
                        name="star"
                        value={st.value}
                        checked={hotelStar === st.value}
                        onChange={() => {
                          setHotelStar(st.value);
                          updateUrlParam('star', st.value);
                        }}
                      />
                      <span className="radio-text">{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Nút Reset Toàn Bộ Footer */}
            {hasActiveFilters && (
              <button 
                className="btn btn-outline w-100 mt-3 btn-reset-filter" 
                type="button"
                onClick={resetFilters}
              >
                <FaRedo /> Đặt lại tất cả bộ lọc
              </button>
            )}
          </aside>

          {/* ========================================================
              MAIN CONTENT (SMART TOP BAR & DUAL HORIZONTAL FILTER LANES)
             ======================================================== */}
          <main className="main-content">
            {/* Thanh Tìm Kiếm Đỉnh Trang */}
            <div className="search-bar-top card-surface">
              <form onSubmit={handleSearchSubmit} className="search-form-list">
                <div className="search-input-wrapper">
                  <FaSearch className="search-lead-icon" />
                  <input 
                    type="search"
                    className="search-input-top" 
                    aria-label="Tìm kiếm điểm đến, tên tour hoặc thành phố khởi hành"
                    placeholder="Tìm kiếm điểm đến, tên tour, đơn vị tổ chức hoặc thành phố..." 
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      type="button" 
                      className="btn-clear-keyword" 
                      onClick={() => { setSearchTerm(''); updateUrlParam('keyword', ''); }}
                      title="Xóa từ khóa"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button type="submit" className="btn btn-primary btn-search-icon" aria-label="Tìm tour">
                  <FaSearch />
                </button>
              </form>
              
              <select 
                className="sort-select" 
                aria-label="Sắp xếp danh sách tour"
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrlParam('sort', e.target.value);
                }}
              >
                <option value="bestseller">Sắp xếp: Phổ biến nhất</option>
                <option value="price_asc">Sắp xếp: Giá tăng dần</option>
                <option value="price_desc">Sắp xếp: Giá giảm dần</option>
                <option value="rating_desc">Sắp xếp: Đánh giá cao nhất</option>
                <option value="newest">Sắp xếp: Tour mới nhất</option>
                <option value="duration_asc">Sắp xếp: Thời lượng ngắn nhất</option>
              </select>
            </div>

            {/* ========================================================
                BỘ LỌC THÔNG MINH 2 LÀN RIÊNG BIỆT (SMART DUAL FILTER LANES)
               ======================================================== */}
            <section className="smart-filter-lanes-container card-surface" aria-label="Bộ lọc 2 làn thông minh">
              {/* LÀN 1: ĐIỂM KHỞI HÀNH (DEPARTURE LANE) */}
              <div className="filter-lane lane-departure">
                <div className="lane-header-row">
                  <span className="lane-badge">
                    <FaMapMarkerAlt className="lane-icon text-accent" />
                    <strong>Nơi Khởi Hành:</strong>
                  </span>
                  <span className="lane-caption">Chọn thành phố xuất phát gần bạn</span>
                </div>
                <div className="lane-chips-wrap">
                  {DEPARTURE_OPTIONS.map(d => {
                    const count = departureCounts[d.value] ?? 0;
                    const isActive = selectedDeparture === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`lane-chip-btn ${isActive ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedDeparture(d.value);
                          updateUrlParam('departure', d.value);
                        }}
                      >
                        <span className="lane-chip-icon">{d.icon}</span>
                        <span className="lane-chip-text">{d.shortLabel || d.label}</span>
                        {count > 0 && <span className="lane-chip-badge">{count}</span>}
                        {isActive && <FaCheck className="lane-chip-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lanes-separator-line" />

              {/* LÀN 2: CHỦ ĐỀ HÀNH TRÌNH (CATEGORY / THEME LANE) */}
              <div className="filter-lane lane-category">
                <div className="lane-header-row">
                  <span className="lane-badge">
                    <FaPlane className="lane-icon text-primary" />
                    <strong>Chủ Đề Hành Trình:</strong>
                  </span>
                  <span className="lane-caption">Khám phá theo phong cách du lịch</span>
                </div>
                <div className="lane-chips-scroll">
                  <button
                    type="button"
                    className={`lane-chip-btn ${selectedCategory === '' ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedCategory('');
                      updateUrlParam('category', '');
                    }}
                  >
                    <span className="lane-chip-icon">✨</span>
                    <span className="lane-chip-text">Tất cả chủ đề</span>
                    {allTours.length > 0 && <span className="lane-chip-badge">{allTours.length}</span>}
                    {selectedCategory === '' && <FaCheck className="lane-chip-check" />}
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
                        className={`lane-chip-btn ${isActive ? 'is-active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(catIdStr);
                          updateUrlParam('category', catIdStr);
                        }}
                      >
                        <span className="lane-chip-icon">{emoji}</span>
                        <span className="lane-chip-text">{cat.name || cat.categoryName}</span>
                        {count > 0 && <span className="lane-chip-badge">{count}</span>}
                        {isActive && <FaCheck className="lane-chip-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Thanh hiển thị kết quả và bộ lọc đang áp dụng */}
            <div className="filter-summary-row">
              <div className="result-count-label">
                Tìm thấy <strong>{tours.length}</strong> hành trình du lịch phù hợp
              </div>
              <div className="active-filter-chips">
                {selectedDeparture && (
                  <span className="filter-chip">
                    <FaMapMarkerAlt style={{ fontSize: '0.7rem', marginRight: '4px' }} />
                    {selectedDeparture}
                    <button type="button" onClick={() => { setSelectedDeparture(''); updateUrlParam('departure', ''); }} aria-label="Bỏ chọn điểm khởi hành"><FaTimes /></button>
                  </span>
                )}
                {selectedCategoryObj && (
                  <span className="filter-chip">
                    <FaPlane style={{ fontSize: '0.7rem', marginRight: '4px' }} />
                    {selectedCategoryObj.name || selectedCategoryObj.categoryName}
                    <button type="button" onClick={() => { setSelectedCategory(''); updateUrlParam('category', ''); }} aria-label="Bỏ chọn danh mục"><FaTimes /></button>
                  </span>
                )}
                {selectedProviderObj && (
                  <span className="filter-chip chip-provider" style={{ borderColor: `${selectedProviderObj.brandColor}66`, color: selectedProviderObj.brandColor, background: `${selectedProviderObj.brandColor}12` }}>
                    <FaBuilding style={{ fontSize: '0.7rem', marginRight: '4px' }} />
                    {selectedProviderObj.shortName}
                    <button type="button" onClick={() => { setSelectedProvider(''); updateUrlParam('provider', ''); }} aria-label="Bỏ chọn đơn vị"><FaTimes /></button>
                  </span>
                )}
                {selectedPriceObj && selectedPriceObj.value && (
                  <span className="filter-chip">
                    {selectedPriceObj.label.split('(')[0].trim()}
                    <button type="button" onClick={() => { setPriceTier(''); updateUrlParam('price', ''); }} aria-label="Bỏ chọn giá"><FaTimes /></button>
                  </span>
                )}
                {selectedDurObj && selectedDurObj.value && (
                  <span className="filter-chip">
                    {selectedDurObj.label.split('(')[0].trim()}
                    <button type="button" onClick={() => { setDurationTier(''); updateUrlParam('duration', ''); }} aria-label="Bỏ chọn thời lượng"><FaTimes /></button>
                  </span>
                )}
                {hotelStar && (
                  <span className="filter-chip">
                    Từ {hotelStar} sao
                    <button type="button" onClick={() => { setHotelStar(''); updateUrlParam('star', ''); }} aria-label="Bỏ chọn sao khách sạn"><FaTimes /></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-chip">
                    "{searchTerm}"
                    <button type="button" onClick={() => { setSearchTerm(''); updateUrlParam('keyword', ''); }} aria-label="Xóa từ khóa"><FaTimes /></button>
                  </span>
                )}
              </div>
            </div>

            {loadError && (
              <div className="empty-state card-surface load-error" role="alert">
                <p>{loadError}</p>
                <button type="button" className="btn btn-primary" onClick={fetchTours}>Thử lại</button>
              </div>
            )}

            {loading ? (
              <TourGridSkeleton count={6} />
            ) : loadError ? null : tours.length > 0 ? (
              <div className="tours-grid-list stagger-children">
                {tours.map(tour => (
                  <TourCard key={tour.id || tour.tourId} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="empty-state card-surface" style={{ borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Không tìm thấy tour phù hợp!</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>
                  Vui lòng thử nới lỏng các tiêu chí lọc (mức giá, nhà tổ chức, điểm khởi hành) để tìm kiếm thêm tour.
                </p>
                <button className="btn btn-primary" onClick={resetFilters}>
                  Xem tất cả các tour
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
