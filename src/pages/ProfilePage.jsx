import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../api/axiosConfig';
import { FaUserCircle, FaShieldAlt, FaKey, FaSave, FaCrown, FaGem, FaMedal, FaCoins, FaCheckCircle, FaPercent } from 'react-icons/fa';
import { getTierInfo } from '../utils/membershipUtils';
import './ProfilePage.css';

const ProfilePage = () => {
  const formatPrice = (val) => {
    return Number(val || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const tierInfo = React.useMemo(() => {
    return getTierInfo(user?.membershipTier, user?.totalSpent);
  }, [user]);


  // Điền dữ liệu người dùng khi đã đăng nhập
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

  // Cập nhật thông tin cơ bản
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/users/me', formData);
      // Đồng bộ thông tin mới vào AuthContext và LocalStorage
      updateUser(res.data);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  // Đổi mật khẩu
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
      toast.error('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await api.put('/users/me/password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(res.data?.message || 'Đổi mật khẩu thành công!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu, vui lòng kiểm tra lại');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-page py-5">
      <div className="container">
        <header className="profile-page-heading">
          <p>Tài khoản</p>
          <h1>Thiết lập tài khoản</h1>
          <span>Quản lý thông tin cá nhân và mật khẩu đăng nhập.</span>
        </header>
        <div className="profile-layout">
          {/* Cột trái: Thông tin tài khoản tóm tắt */}
          <div className="profile-sidebar card-box text-center">
            <div className="avatar-placeholder">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3 className="mt-3" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {user?.fullName || user?.username}
            </h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
              @{user?.username}
            </p>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: user?.role === 'ADMIN' ? '#e0f2fe' : '#f1f5f9',
              color: user?.role === 'ADMIN' ? '#0369a1' : '#475569',
              border: user?.role === 'ADMIN' ? '1px solid #bae6fd' : '1px solid #e2e8f0'
            }}>
              <FaShieldAlt /> {user?.role === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Khách Hàng (Customer)'}
            </span>
          </div>
          

          {/* Cột phải: Form cập nhật thông tin và đổi mật khẩu */}
          <div className="profile-main card-box">
            {/* THẺ HỘI VIÊN ĐIỆN TỬ VIP - UI/UX PRO MAX */}
            <div 
              className="membership-bento-card"
              style={{
                background: tierInfo.gradient,
                border: tierInfo.border
              }}
            >
              <div className="membership-card-top">
                <div className="membership-brand">
                  <div>
                    <div className="membership-brand-logo">DU LỊCH VIỆT · VIP CLUB</div>
                    <div className="membership-brand-sub">Chương trình đặc quyền khách hàng thân thiết</div>
                  </div>
                </div>
                <div 
                  className="membership-tier-badge"
                  style={{
                    background: tierInfo.badgeBg,
                    color: tierInfo.badgeColor,
                    border: '1px solid ' + tierInfo.badgeColor
                  }}
                >
                  {tierInfo.key === 'VIP_PLATINUM' ? <FaCrown /> : tierInfo.key === 'DIAMOND' ? <FaGem /> : <FaMedal />}
                  <span>{tierInfo.shortName}</span>
                </div>
              </div>

              <div className="membership-chip-row">
                <div className="emv-chip" />
                <div className="membership-card-number">
                  DLV · {String(user?.id || 1).padStart(4, '0')} · {tierInfo.shortName.toUpperCase()}
                </div>
              </div>

              <div className="membership-info-grid">
                <div className="membership-info-item">
                  <span className="info-label">Chủ thẻ hội viên</span>
                  <span className="info-val">{user?.fullName || user?.username || 'Khách Hàng'}</span>
                </div>
                <div className="membership-info-item">
                  <span className="info-label">Điểm tích lũy hiện có</span>
                  <span className="info-val" style={{ color: '#fde047', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaCoins /> {Number(user?.loyaltyPoints || 0).toLocaleString('vi-VN')} điểm
                  </span>
                </div>
                <div className="membership-info-item">
                  <span className="info-label">Tổng chi tiêu tích lũy</span>
                  <span className="info-val">{formatPrice(user?.totalSpent || 0)}</span>
                </div>
                <div className="membership-info-item">
                  <span className="info-label">Chiết khấu đặc quyền</span>
                  <span className="info-val" style={{ color: '#4ade80' }}>
                    {tierInfo.discountPercent > 0 ? `Giảm ${tierInfo.discountPercent}%` : 'Tích 1% điểm'}
                  </span>
                </div>
              </div>

              {/* Thanh tiến trình thăng hạng */}
              {tierInfo.nextTier && (
                <div className="membership-progress-box">
                  <div className="progress-header">
                    <span>Tiến trình lên hạng <strong>{tierInfo.nextTier.shortName}</strong> ({tierInfo.progress}%)</span>
                    <span>Còn thiếu: <strong>{formatPrice(tierInfo.remainingToNext)}</strong></span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${tierInfo.progress}%` }} />
                  </div>
                </div>
              )}

              {/* Danh sách đặc quyền */}
              <div className="membership-perks-row">
                {tierInfo.perks.map((perk, idx) => (
                  <span key={idx} className="perk-pill">
                    <FaCheckCircle style={{ color: '#4ade80', fontSize: '0.75rem' }} /> {perk}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <FaUserCircle style={{ fontSize: '1.4rem', color: '#0ea5e9' }} />
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Thông Tin Cá Nhân
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Họ và tên</label>
                <input 
                  type="text" 
                  name="fullName" 
                  className="form-control" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <div className="form-row mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Địa chỉ Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    placeholder="email@example.com"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Số điện thoại</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-control" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    placeholder="VD: 0901234567"
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Địa chỉ liên hệ</label>
                <input 
                  type="text" 
                  name="address" 
                  className="form-control" 
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={savingProfile}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <FaSave /> {savingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </form>

            <hr className="my-5" style={{ borderColor: '#e2e8f0' }} />
            
            {/* Đổi mật khẩu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <FaKey style={{ fontSize: '1.2rem', color: '#f59e0b' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Đổi Mật Khẩu
              </h3>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group mb-3">
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  placeholder="Nhập mật khẩu hiện tại (demo: 123456)"
                />
              </div>

              <div className="form-row mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-outline" 
                disabled={changingPassword}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <FaKey /> {changingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
