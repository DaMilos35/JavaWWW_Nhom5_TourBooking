import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, categoryApi, tourApi } from '../../api/axiosConfig';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminTourForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    duration: '',
    departureLocation: '',
    imageUrl: '',
    availableSeats: 10,
    status: 'ACTIVE',
    rating: 5
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchTour();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getAll();
      setCategories(res.data);
      if (!isEdit && res.data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTour = async () => {
    try {
      const res = await tourApi.getById(id);
      const tour = res.data;
      setFormData({
        name: tour.name || '',
        categoryId: tour.category?.id || '',
        description: tour.description || '',
        price: tour.price || '',
        duration: tour.duration || '',
        departureLocation: tour.departureLocation || '',
        imageUrl: tour.imageUrl || '',
        availableSeats: tour.availableSeats || 10,
        status: tour.status || 'ACTIVE',
        rating: tour.rating || 5
      });
    } catch (error) {
      toast.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u tour');
      navigate('/admin/tours');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        availableSeats: parseInt(formData.availableSeats),
        rating: parseFloat(formData.rating),
        categoryId: parseInt(formData.categoryId)
      };

      if (isEdit) {
        await adminApi.updateTour(id, dataToSubmit);
        toast.success('Cáº­p nháº­t tour thÃ nh cÃ´ng');
      } else {
        await adminApi.createTour(dataToSubmit);
        toast.success('ThÃªm tour thÃ nh cÃ´ng');
      }
      navigate('/admin/tours');
    } catch (error) {
      toast.error(error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin-page">
      <div className="content-header mb-4">
        <h2>{isEdit ? 'Chá»‰nh sá»­a Tour' : 'ThÃªm Tour Má»›i'}</h2>
      </div>

      <div className="admin-card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-8">
                <div className="form-group">
                  <label className="form-label">TÃªn Tour *</label>
                  <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Danh má»¥c *</label>
                      <select name="categoryId" className="form-control" value={formData.categoryId} onChange={handleChange} required>
                        <option value="">-- Chá»n danh má»¥c --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">GiÃ¡ (VNÄ) *</label>
                      <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Thá»i gian (VD: 3 NgÃ y 2 ÄÃªm) *</label>
                      <input type="text" name="duration" className="form-control" value={formData.duration} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">NÆ¡i khá»Ÿi hÃ nh *</label>
                      <input type="text" name="departureLocation" className="form-control" value={formData.departureLocation} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MÃ´ táº£ chi tiáº¿t (Há»— trá»£ HTML)</label>
                  <textarea name="description" className="form-control" rows="8" value={formData.description} onChange={handleChange}></textarea>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label className="form-label">URL áº¢nh Cover</label>
                  <input type="text" name="imageUrl" className="form-control" value={formData.imageUrl} onChange={handleChange} />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="img-fluid mt-2 rounded" style={{maxHeight: '150px'}} />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Sá»‘ chá»— trá»‘ng *</label>
                  <input type="number" name="availableSeats" className="form-control" value={formData.availableSeats} onChange={handleChange} required min="1" />
                </div>

                <div className="form-group">
                  <label className="form-label">ÄÃ¡nh giÃ¡ (0-5)</label>
                  <input type="number" name="rating" className="form-control" value={formData.rating} onChange={handleChange} step="0.1" min="0" max="5" />
                </div>

                <div className="form-group">
                  <label className="form-label">Tráº¡ng thÃ¡i</label>
                  <select name="status" className="form-control" value={formData.status} onChange={handleChange}>
                    <option value="ACTIVE">Hoáº¡t Ä‘á»™ng</option>
                    <option value="INACTIVE">KhÃ³a</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 border-top pt-3 text-right">
              <button type="button" className="btn btn-secondary mr-2" onClick={() => navigate('/admin/tours')}>Há»§y</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Äang lÆ°u...' : 'LÆ°u Thay Äá»•i'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminTourForm;

