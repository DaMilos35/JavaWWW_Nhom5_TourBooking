import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaRedo, FaTimes, FaBuilding, FaMapMarkerAlt, 
  FaClock, FaMoneyBillWave, FaHotel, FaPlane, FaStar 
} from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import { TourGridSkeleton } from '../components/common/TourCardSkeleton';
import { ALL_CERTIFIED_PROVIDERS } from '../utils/providerData';
import useScrollReveal from '../hooks/useScrollReveal';
import './TourListPage.css';

const DEPARTURE_OPTIONS = [
  { value: '', label: 'Tất cả điểm khởi hành' },
  { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' }
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryLoadError, setCategoryLoadError] = useState(false);

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
    fetchCategories();
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
      setTours(res.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tour theo Specification:', error);
      setTours([]);
      setLoadError('Chưa tải được danh sách tour. Kiểm tra kết nối máy chủ rồi thử lại.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedProvider, selectedDeparture, priceTier, durationTier, hotelStar, sortBy]);

  // Kích hoạt fetch mỗi khi filter thay đổi
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

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
    navigate('/tours');
  };

  // Tìm tên hiển thị của các active chips
  const selectedCategoryObj = categories.find(c => String(c.id || c.categoryId) === String(selectedCategory));
  const selectedProviderObj = ALL_CERTIFIED_PROVIDERS.find(p => String(p.id) === String(selectedProvider));
  const selectedPriceObj = PRICE_TIERS.find(p => p.value === priceTier);
  const selectedDurObj = DURATION_OPTIONS.find(d => d.value === durationTier);

  return (
    <div className="tour-list-page">
      <div className="container py-4">
        <div className="layout-grid">
          {/* Sidebar Bộ Lọc Nâng Cao */}
          <aside className="sidebar">
            <div className="filter-card card-surface">
              <div className="filter-card-header">
                <h3 className="filter-title">
                  <FaFilter className="text-accent" /> BỘ LỌC TÌM KIẾM
                </h3>
                {(selectedCategory || selectedProvider || selectedDeparture || priceTier || durationTier || hotelStar || searchTerm) && (
                  <button type="button" className="btn-quick-clear" onClick={resetFilters} title="Xóa tất cả bộ lọc">
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* 1. Lọc theo Điểm Khởi Hành (Ưu tiên số 1) */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaMapMarkerAlt className="filter-icon" /> Điểm Khởi Hành
                </h4>
                {DEPARTURE_OPTIONS.map(d => (
                  <label key={d.value} className="radio-label">
                    <input
                      type="radio"
                      name="departure"
                      value={d.value}
                      checked={selectedDeparture === d.value}
                      onChange={() => {
                        setSelectedDeparture(d.value);
                        updateUrlParam('departure', d.value);
                      }}
                    />
                    {d.label}
                  </label>
                ))}
              </div>

              {/* 2. Lọc theo Danh Mục Tour */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaPlane className="filter-icon" /> Danh Mục Tour
                </h4>
                <label className="radio-label">
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
                  Tất cả danh mục ({categories.length})
                </label>
                {categories.map(cat => {
                  const catIdStr = String(cat.id || cat.categoryId);
                  return (
                    <label key={catIdStr} className="radio-label">
                      <input 
                        type="radio" 
                        name="category" 
                        value={catIdStr} 
                        checked={String(selectedCategory) === catIdStr}
                        onChange={() => {
                          setSelectedCategory(catIdStr);
                          updateUrlParam('category', catIdStr);
                        }}
                      />
                      {cat.name || cat.categoryName}
                    </label>
                  );
                })}
                {categoryLoadError && (
                  <div className="filter-error" role="status">
                    <span>Chưa tải được danh mục tour.</span>
                    <button type="button" onClick={fetchCategories}>Thử lại</button>
                  </div>
                )}
              </div>

              {/* 3. Lọc theo Mức Giá Tour */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaMoneyBillWave className="filter-icon" /> Mức Giá Tour
                </h4>
                {PRICE_TIERS.map(pt => (
                  <label key={pt.value} className="radio-label">
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
                    {pt.label}
                  </label>
                ))}
              </div>

              {/* 4. Lọc theo Đơn Vị Tổ Chức (Duy nhất 6 đối tác, không trùng lặp) */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaBuilding className="filter-icon" /> Đơn Vị Tổ Chức Tour
                </h4>
                <label className="radio-label">
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
                  Tất cả đơn vị lữ hành
                </label>
                {ALL_CERTIFIED_PROVIDERS.map(p => (
                  <label key={p.id} className="radio-label">
                    <input
                      type="radio"
                      name="provider"
                      value={String(p.id)}
                      checked={String(selectedProvider) === String(p.id)}
                      onChange={() => {
                        setSelectedProvider(String(p.id));
                        updateUrlParam('provider', String(p.id));
                      }}
                    />
                    <span 
                      className="provider-filter-name" 
                      style={{ 
                        color: String(selectedProvider) === String(p.id) ? p.brandColor : 'inherit', 
                        fontWeight: String(selectedProvider) === String(p.id) ? 700 : 500 
                      }}
                    >
                      {p.shortName}
                    </span>
                  </label>
                ))}
              </div>

              {/* 5. Lọc theo Thời Lượng Chuyến Đi */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaClock className="filter-icon" /> Thời Lượng Tour
                </h4>
                {DURATION_OPTIONS.map(dur => (
                  <label key={dur.value} className="radio-label">
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
                    {dur.label}
                  </label>
                ))}
              </div>

              {/* 6. Lọc theo Tiêu Chuẩn Khách Sạn */}
              <div className="filter-group">
                <h4 className="filter-group-heading">
                  <FaHotel className="filter-icon" /> Tiêu Chuẩn Lưu Trú
                </h4>
                {STAR_OPTIONS.map(st => (
                  <label key={st.value} className="radio-label">
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
                    {st.label}
                  </label>
                ))}
              </div>

              <button 
                className="btn btn-outline w-100 mt-2 btn-reset-filter" 
                type="button"
                onClick={resetFilters}
              >
                <FaRedo /> Đặt lại tất cả bộ lọc
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="search-bar-top card-surface">
              <form onSubmit={handleSearchSubmit} className="search-form-list">
                <input 
                  type="search"
                  className="search-input-top" 
                  aria-label="Tìm kiếm điểm đến, tên tour hoặc thành phố khởi hành"
                  placeholder="Tìm kiếm điểm đến, tên tour, đơn vị tổ chức hoặc thành phố..." 
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
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

            {/* Thanh hiển thị kết quả và bộ lọc đang áp dụng */}
            <div className="filter-summary-row">
              <div className="result-count-label">
                Tìm thấy <strong>{tours.length}</strong> hành trình du lịch phù hợp
              </div>
              <div className="active-filter-chips">
                {selectedProviderObj && (
                  <span className="filter-chip chip-provider" style={{ borderColor: `${selectedProviderObj.brandColor}66`, color: selectedProviderObj.brandColor, background: `${selectedProviderObj.brandColor}12` }}>
                    <FaBuilding style={{ fontSize: '0.7rem', marginRight: '4px' }} />
                    {selectedProviderObj.shortName}
                    <button type="button" onClick={() => { setSelectedProvider(''); updateUrlParam('provider', ''); }} aria-label="Bỏ chọn đơn vị"><FaTimes /></button>
                  </span>
                )}
                {selectedDeparture && (
                  <span className="filter-chip">
                    <FaMapMarkerAlt style={{ fontSize: '0.7rem', marginRight: '4px' }} />
                    {selectedDeparture}
                    <button type="button" onClick={() => { setSelectedDeparture(''); updateUrlParam('departure', ''); }} aria-label="Bỏ chọn điểm khởi hành"><FaTimes /></button>
                  </span>
                )}
                {selectedCategoryObj && (
                  <span className="filter-chip">
                    {selectedCategoryObj.name || selectedCategoryObj.categoryName}
                    <button type="button" onClick={() => { setSelectedCategory(''); updateUrlParam('category', ''); }} aria-label="Bỏ chọn danh mục"><FaTimes /></button>
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
