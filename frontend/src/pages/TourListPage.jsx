import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { tourApi, categoryApi } from '../api/axiosConfig';
import TourCard from '../components/tours/TourCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './TourListPage.css';

const TourListPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');

  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCategories();
    fetchTours();
  }, [selectedCategory, initialCategory]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const fetchTours = async () => {
    setLoading(true);
    try {
      let res;
      if (selectedCategory) {
        res = await tourApi.getByCategory(selectedCategory);
      } else {
        res = await tourApi.getAll();
      }
      setTours(res.data);
    } catch (error) {
      console.error('Error fetching tours', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (searchTerm.trim()) {
        const res = await tourApi.search(searchTerm);
        setTours(res.data);
      } else {
        fetchTours();
      }
    } catch (error) {
      console.error('Search error', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('newest');
    fetchTours();
  };

  // Client-side filtering & sorting for demo (ideally should be server-side)
  let displayedTours = [...tours];
  if (priceRange === 'low') displayedTours = displayedTours.filter(t => t.price < 5000000);
  if (priceRange === 'mid') displayedTours = displayedTours.filter(t => t.price >= 5000000 && t.price <= 10000000);
  if (priceRange === 'high') displayedTours = displayedTours.filter(t => t.price > 10000000);

  if (sortBy === 'price_asc') displayedTours.sort((a, b) => a.price - b.price);
  if (sortBy === 'price_desc') displayedTours.sort((a, b) => b.price - a.price);

  return (
    <div className="tour-list-page bg-light">
      <div className="container py-4">
        <div className="layout-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="filter-card">
              <h3><FaFilter /> Bộ Lọc</h3>
              
              <div className="filter-group">
                <h4>Danh Mục</h4>
                {categories.map(cat => (
                  <label key={cat.id} className="radio-label">
                    <input 
                      type="radio" 
                      name="category" 
                      value={cat.id} 
                      checked={selectedCategory === cat.id.toString()}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Mức Giá</h4>
                <label className="radio-label">
                  <input type="radio" name="price" value="low" checked={priceRange === 'low'} onChange={(e) => setPriceRange(e.target.value)} />
                  Dưới 5 triệu
                </label>
                <label className="radio-label">
                  <input type="radio" name="price" value="mid" checked={priceRange === 'mid'} onChange={(e) => setPriceRange(e.target.value)} />
                  5 - 10 triệu
                </label>
                <label className="radio-label">
                  <input type="radio" name="price" value="high" checked={priceRange === 'high'} onChange={(e) => setPriceRange(e.target.value)} />
                  Trên 10 triệu
                </label>
              </div>

              <button className="btn btn-outline w-100 mt-3" onClick={resetFilters}>Xóa bộ lọc</button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="search-bar-top">
              <form onSubmit={handleSearch} className="search-form-list">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Tìm kiếm tour..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary"><FaSearch /></button>
              </form>
              
              <select className="form-control sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : displayedTours.length > 0 ? (
              <div className="tours-grid">
                {displayedTours.map(tour => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>Không tìm thấy tour nào phù hợp!</h3>
                <p>Vui lòng thử lại với tiêu chí tìm kiếm khác.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default TourListPage;
