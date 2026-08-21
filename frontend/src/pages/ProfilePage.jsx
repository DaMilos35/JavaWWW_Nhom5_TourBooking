import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/me', formData);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page bg-light py-4">
      <div className="container">
        <div className="profile-layout">
          <div className="profile-sidebar card-box text-center">
            <div className="avatar-placeholder">{user?.username?.charAt(0).toUpperCase()}</div>
            <h3 className="mt-3">{user?.username}</h3>
            <p className="text-muted">{user?.role}</p>
          </div>
          
          <div className="profile-main card-box">
            <h2 className="mb-4">Hồ Sơ Của Tôi</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} readOnly />
                </div>
                <div className="form-group half">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ</label>
                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>

            <hr className="my-4" />
            
            <h3 className="mb-3">Đổi mật khẩu</h3>
            <form>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input type="password" name="oldPassword" className="form-control" />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input type="password" name="newPassword" className="form-control" />
              </div>
              <button type="button" className="btn btn-secondary">Đổi Mật Khẩu</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
