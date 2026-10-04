import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaLock, 
  FaKey, 
  FaCheckCircle, 
  FaStar, 
  FaGlobe, 
  FaTwitter, 
  FaInstagram, 
  FaFacebookF, 
  FaCamera, 
  FaClipboardList, 
  FaHeart,
  FaCalendarAlt,
  FaShieldAlt,
  FaPen
} from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'password'
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    bio: 'Đam mê khám phá các miền đất mới, trải nghiệm văn hóa bản địa và chia sẻ hành trình du lịch cùng người thân.'
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/me', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      });
      updateUser(res.data);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.warning('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.warning('Xác nhận mật khẩu mới không khớp');
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/users/me/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setActiveTab('general');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mật khẩu hiện tại không chính xác');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCoverUpload = () => {
    toast.info('Tính năng tải ảnh bìa đã ghi nhận ảnh mẫu mới.');
    setCoverPhoto('https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=80');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="profile-setting-page">
      {/* Cover Photo Banner (Figma: Ảnh bìa) */}
      <div className="profile-cover-banner" style={{ backgroundImage: `url(${coverPhoto})` }}>
        <div className="cover-overlay" />
        <div className="container cover-content-container">
          <button type="button" className="btn-change-cover" onClick={handleCoverUpload}>
            <FaCamera /> Kéo và thả ảnh của bạn vào đây hoặc nhấp để đổi ảnh bìa
          </button>
        </div>
      </div>

      <div className="container profile-main-wrapper">
        <div className="profile-layout-grid">
          {/* Left Column: Aside User Info Card (Figma: Aside - Cột trái) */}
          <aside className="profile-aside-card">
            <div className="user-avatar-badge-wrap">
              <div className="user-aside-avatar">
                {getInitial(user?.fullName || user?.username)}
              </div>
              <button type="button" className="avatar-edit-icon" title="Cập nhật ảnh đại diện">
                <FaPen />
              </button>
            </div>

            <h2 className="aside-user-name">{user?.fullName || user?.username || 'Khách Du Lịch'}</h2>
            <div className="aside-verified-tag">
              <FaCheckCircle /> Đã xác thực danh tính
            </div>

            <div className="aside-rating-row">
              <span className="star-icon"><FaStar /> 5.0</span>
              <span className="rating-count">(256 đánh giá)</span>
            </div>

            <div className="aside-links-list">
              <div className="aside-link-item">
                <FaGlobe className="icon" />
                <a href="https://dulichviet.vn" target="_blank" rel="noreferrer">dulichviet.vn</a>
              </div>
              <div className="aside-link-item">
                <FaCalendarAlt className="icon" />
                <span>Thành viên từ năm 2024</span>
              </div>
              <div className="aside-link-item">
                <FaMapMarkerAlt className="icon" />
                <span>{formData.address || 'Hồ Chí Minh, Việt Nam'}</span>
              </div>
            </div>

            <div className="aside-socials-row">
              <a href="https://twitter.com" className="social-pill" target="_blank" rel="noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" className="social-pill" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://facebook.com" className="social-pill" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
            </div>

            <div className="aside-nav-divider" />

            {/* Quick Links Menu */}
            <div className="aside-nav-menu">
              <button 
                type="button" 
                className={`aside-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <FaUser className="btn-icon" /> Thông tin cá nhân
              </button>
              <button 
                type="button" 
                className={`aside-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FaKey className="btn-icon" /> Đổi mật khẩu
              </button>
              <Link to="/my-orders" className="aside-tab-btn">
                <FaClipboardList className="btn-icon" /> Lịch sử đặt tour
              </Link>
              <Link to="/wishlist" className="aside-tab-btn">
                <FaHeart className="btn-icon" /> Tour đã lưu
              </Link>
            </div>
          </aside>

          {/* Right Column: Settings Content Panels */}
          <main className="profile-content-col">
            {activeTab === 'general' && (
              <div className="profile-panel-box">
                <div className="panel-greeting-header">
                  <span className="greeting-eyebrow">Tài khoản cá nhân</span>
                  <h1 className="greeting-title">Xin chào, tôi là {user?.fullName || user?.username}</h1>
                  <p className="greeting-desc">
                    Quản lý thông tin liên hệ và tùy chỉnh hồ sơ cá nhân để nhận dịch vụ đặt tour nhanh chóng và thuận tiện nhất.
                  </p>
                </div>

                <form onSubmit={handleProfileSubmit} className="profile-form">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="fullName">Họ và tên *</label>
                      <input 
                        type="text" 
                        id="fullName"
                        value={formData.fullName} 
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn An"
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Địa chỉ Email *</label>
                      <input 
                        type="email" 
                        id="email"
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="phone">Số điện thoại</label>
                      <input 
                        type="tel" 
                        id="phone"
                        value={formData.phone} 
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0901234567"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="address">Địa chỉ thường trú</label>
                      <input 
                        type="text" 
                        id="address"
                        value={formData.address} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Quận 1, TP. Hồ Chí Minh"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="bio">Giới thiệu bản thân (Bio)</label>
                    <textarea 
                      id="bio"
                      rows="3" 
                      value={formData.bio} 
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Chia sẻ sở thích du lịch, địa điểm yêu thích của bạn..."
                      className="form-control"
                    />
                  </div>

                  <div className="form-actions-row">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-save-profile"
                      disabled={savingProfile}
                    >
                      {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi hồ sơ'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="profile-panel-box">
                <div className="panel-greeting-header">
                  <span className="greeting-eyebrow">Bảo mật tài khoản</span>
                  <h1 className="greeting-title">Đổi mật khẩu</h1>
                  <p className="greeting-desc">
                    Hãy sử dụng mật khẩu mạnh với ít nhất 6 ký tự kết hợp chữ cái và chữ số để bảo vệ tài khoản của bạn.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="profile-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="oldPassword">Mật khẩu hiện tại *</label>
                    <input 
                      type="password" 
                      id="oldPassword"
                      value={passwordData.oldPassword} 
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      placeholder="••••••••"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label" htmlFor="newPassword">Mật khẩu mới *</label>
                      <input 
                        type="password" 
                        id="newPassword"
                        value={passwordData.newPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                      <input 
                        type="password" 
                        id="confirmPassword"
                        value={passwordData.confirmPassword} 
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-save-profile"
                      disabled={changingPassword}
                    >
                      {changingPassword ? 'Đang xử lý...' : 'Cập nhật mật khẩu mới'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setActiveTab('general')}
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
