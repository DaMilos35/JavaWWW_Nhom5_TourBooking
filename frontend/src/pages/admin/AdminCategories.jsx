import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { adminApi, categoryApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCat, setCurrentCat] = useState({ id: null, name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
    } catch (error) {
      toast.error('Lá»—i khi táº£i danh má»¥c');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCat(cat);
    } else {
      setCurrentCat({ id: null, name: '', description: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCat.id) {
        await adminApi.updateCategory(currentCat.id, currentCat);
        toast.success('Cáº­p nháº­t danh má»¥c thÃ nh cÃ´ng');
      } else {
        await adminApi.createCategory(currentCat);
        toast.success('ThÃªm danh má»¥c thÃ nh cÃ´ng');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a danh má»¥c nÃ y? (KhÃ´ng thá»ƒ xÃ³a náº¿u Ä‘ang cÃ³ tour)')) {
      try {
        await adminApi.deleteCategory(id);
        toast.success('XÃ³a danh má»¥c thÃ nh cÃ´ng');
        fetchCategories();
      } catch (error) {
        toast.error(error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a danh má»¥c nÃ y');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header d-flex justify-content-between align-items-center mb-4">
        <h2>Quáº£n lÃ½ Danh má»¥c</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}><FaPlus /> ThÃªm Danh má»¥c</button>
      </div>

      <div className="admin-card">
        <div className="card-body p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TÃªn Danh má»¥c</th>
                <th>MÃ´ táº£</th>
                <th>HÃ nh Ä‘á»™ng</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? categories.map(cat => (
                <tr key={cat.id}>
                  <td>{cat.id}</td>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.description || 'KhÃ´ng cÃ³ mÃ´ táº£'}</td>
                  <td>
                    <button className="btn btn-sm btn-info mr-2" onClick={() => handleOpenModal(cat)}><FaEdit /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat.id)}><FaTrash /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="text-center py-4">ChÆ°a cÃ³ danh má»¥c nÃ o</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal */}
      {showModal && (
        <div className="modal-overlay" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div className="modal-content" style={{backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px'}}>
            <h3>{currentCat.id ? 'Sá»­a Danh má»¥c' : 'ThÃªm Danh má»¥c'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">TÃªn danh má»¥c *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={currentCat.name} 
                  onChange={(e) => setCurrentCat({...currentCat, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">MÃ´ táº£</label>
                <textarea 
                  className="form-control" 
                  value={currentCat.description} 
                  onChange={(e) => setCurrentCat({...currentCat, description: e.target.value})}
                  rows="3"
                ></textarea>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <button type="button" className="btn btn-secondary mr-2" onClick={() => setShowModal(false)}>Há»§y</button>
                <button type="submit" className="btn btn-primary">LÆ°u</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

