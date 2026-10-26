import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaRedo, FaTimes } from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './TourListPage.css';

const TourListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const paramCategory = searchParams.get('category');
  const paramKeyword = searchParams.get('keyword');
  const paramPrice = searchParams.get('price');

  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [categoryLoadError, setCategoryLoadError] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(paramKeyword || '');
  const [selectedCategory, setSelectedCategory] = useState(paramCategory || '');
  const [priceRange, setPriceRange] = useState(paramPrice || '');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(paramCategory || '');
    setSearchTerm(paramKeyword || '');
    setPriceRange(paramPrice || '');
  }, [location.search]);

  useEffect(() => {
    fetchTours();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setCategoryLoadError(false);
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (error) {
      setCategoryLoadError(true);
    }
  };

  const fetchTours = async () => {
    setLoading(true);
    setLoadError('');
    try {
      let res;
      if (selectedCategory) {
        res = await tourApi.getByCategory(selectedCategory);
      } else {
        res = await tourApi.getAll();
      }
      setTours(res.data || []);
    } catch (error) {
      setTours([]);
      setLoadError('Chưa tải được danh sách tour. Kiểm tra kết nối máy chủ rồi thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('keyword', searchTerm.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceRange) params.set('price', priceRange);
    const query = params.toString();
    navigate(query ? `/tours?${query}` : '/tours');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('newest');
    navigate('/tours');
  };

  // Client-side filtering & sorting for instant response
  let displayedTours = tours.filter(tour => {
    const tourName = (tour.name || tour.tourName || '').toLowerCase();
    const tourDesc = (tour.description || '').toLowerCase();
    const tourLoc = (tour.departureLocation || '').toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch = !query || 
      tourName.includes(query) || 
      tourDesc.includes(query) || 
      tourLoc.includes(query);

    return matchesSearch;
  });

  if (priceRange === 'low') displayedTours = displayedTours.filter(t => t.price < 5000000);
  if (priceRange === 'mid') displayedTours = displayedTours.filter(t => t.price >= 5000000 && t.price <= 10000000);
  if (priceRange === 'high') displayedTours = displayedTours.filter(t => t.price > 10000000);

  if (sortBy === 'newest') {
    const getCreatedAt = (tour) => {
      const timestamp = Date.parse(tour.createdAt || tour.created_at || '');
      return Number.isFinite(timestamp) ? timestamp : 0;
    };
    displayedTours.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
  }
  if (sortBy === 'price_asc') displayedTours.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') displayedTours.sort((a, b) => b.price - a.price);

  const selectedCategoryObj = categories.find(c => String(c.id || c.categoryId) === String(selectedCategory));

  return (
    <div className="tour-list-page">
      <div className="container py-4">
        <div className="layout-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="filter-card card-surface">
              <h3 className="filter-title"><FaFilter className="text-accent" /> BỘ LỌC TÌM KIẾM</h3>
              
              <div className="filter-group">
                <h4>Danh Mục Tour</h4>
                <label className="radio-label">
                  <input 
                    type="radio" 
                    name="category" 
                    value="" 
                    checked={selectedCategory === ''} 
                    onChange={() => setSelectedCategory('')} 
                  />
                  Tất cả các tour
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
                        onChange={() => setSelectedCategory(catIdStr)}
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

              <div className="filter-group">
                <h4>Mức Giá Tour</h4>
                <label className="radio-label">
                  <input type="radio" name="price" value="" checked={priceRange === ''} onChange={(e) => setPriceRange(e.target.value)} />
                  Mọi mức giá
                </label>
                <label className="radio-label">
                  <input type="radio" name="price" value="low" checked={priceRange === 'low'} onChange={(e) => setPriceRange(e.target.value)} />
                  Dưới 5 triệu VNĐ
                </label>
                <label className="radio-label">
                  <input type="radio" name="price" value="mid" checked={priceRange === 'mid'} onChange={(e) => setPriceRange(e.target.value)} />
                  Từ 5 - 10 triệu VNĐ
                </label>
                <label className="radio-label">
                  <input type="radio" name="price" value="high" checked={priceRange === 'high'} onChange={(e) => setPriceRange(e.target.value)} />
                  Trên 10 triệu VNĐ
                </label>
              </div>

              <button 
                className="btn btn-outline w-100 mt-2 btn-reset-filter" 
                type="button"
                onClick={resetFilters}
              >
                <FaRedo /> Đặt lại bộ lọc
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="search-bar-top card-surface">
              <form onSubmit={handleSearch} className="search-form-list">
                <input 
                  type="search"
                  className="search-input-top" 
                  aria-label="Tìm theo điểm đến, tên tour hoặc thành phố khởi hành"
                  placeholder="Tìm kiếm điểm đến, tên tour hoặc thành phố khởi hành..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-search-icon" aria-label="Tìm tour">
                  <FaSearch />
                </button>
              </form>
              
              <select 
                className="sort-select" 
                aria-label="Sắp xếp danh sách tour"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="price_asc">Sắp xếp: Giá tăng dần</option>
                <option value="price_desc">Sắp xếp: Giá giảm dần</option>
              </select>
            </div>

            {/* Thanh hiển thị kết quả và bộ lọc đang áp dụng */}
            <div className="filter-summary-row">
              <div className="result-count-label">
                Tìm thấy <strong>{displayedTours.length}</strong> hành trình phù hợp
              </div>
              <div className="active-filter-chips">
                {selectedCategoryObj && (
                  <span className="filter-chip">
                    {selectedCategoryObj.name || selectedCategoryObj.categoryName}
                    <button type="button" onClick={() => setSelectedCategory('')} aria-label="Bỏ chọn danh mục"><FaTimes /></button>
                  </span>
                )}
                {priceRange && (
                  <span className="filter-chip">
                    {priceRange === 'low' ? 'Dưới 5 triệu' : priceRange === 'mid' ? '5 - 10 triệu' : 'Trên 10 triệu'}
                    <button type="button" onClick={() => setPriceRange('')} aria-label="Bỏ chọn giá"><FaTimes /></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-chip">
                    "{searchTerm}"
                    <button type="button" onClick={() => setSearchTerm('')} aria-label="Xóa từ khóa"><FaTimes /></button>
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
              <LoadingSpinner />
            ) : loadError ? null : displayedTours.length > 0 ? (
              <div className="tours-grid-list">
                {displayedTours.map(tour => (
                  <TourCard key={tour.id || tour.tourId} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="empty-state card-surface" style={{ borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Không tìm thấy tour phù hợp!</h3>
                <p style={{ color: '#64748b', marginBottom: '20px' }}>Vui lòng thử điều chỉnh lại từ khóa hoặc xóa bớt tiêu chí lọc.</p>
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
