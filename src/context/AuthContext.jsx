import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi app khởi động: kiểm tra session trên server còn sống không
  useEffect(() => {
    authApi.me()
      .then((res) => {
        const { userId, username, email, role, fullName, phone, address, membershipTier, loyaltyPoints, totalSpent } = res.data;
        const cleanRole = (role || '').replace(/^ROLE_/, '').trim().toUpperCase();
        const serverUser = {
          id: userId,
          username,
          email,
          role: cleanRole,
          fullName: fullName || username,
          phone: phone || '',
          address: address || '',
          membershipTier: membershipTier || 'STANDARD',
          loyaltyPoints: loyaltyPoints || 0,
          totalSpent: totalSpent || 0
        };
        setUser(serverUser);
        localStorage.setItem('user_display', JSON.stringify({
          id: userId,
          username,
          email,
          fullName: serverUser.fullName,
          role: cleanRole,
          membershipTier: serverUser.membershipTier
        }));
      })
      .catch(() => {
        // Local storage is display-only; it must never restore an authenticated role without a server session.
        localStorage.removeItem('user_display');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { userId, username, email, role, fullName, phone, address, membershipTier, loyaltyPoints, totalSpent } = response.data;
      const cleanRole = (role || '').replace(/^ROLE_/, '');
      const newUser = {
        id: userId,
        username,
        email,
        role: cleanRole,
        fullName: fullName || username,
        phone: phone || '',
        address: address || '',
        membershipTier: membershipTier || 'STANDARD',
        loyaltyPoints: loyaltyPoints || 0,
        totalSpent: totalSpent || 0
      };
      setUser(newUser);
      // Lưu tên vào localStorage để hiển thị nhanh (không phải để xác thực)
      localStorage.setItem('user_display', JSON.stringify({
        username,
        fullName: newUser.fullName,
        role: cleanRole,
        membershipTier: newUser.membershipTier
      }));
      return { success: true, user: newUser };
    } catch (error) {
      let message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      const status = error.response?.status;
      const respData = error.response?.data;

      if (respData?.message) {
        message = respData.message;
      } else if (status === 401) {
        message = 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      } else if (status === 403) {
        message = 'Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.';
      } else if (!error.response) {
        message = 'Không thể kết nối máy chủ. Vui lòng thử lại sau.';
      }
      return { success: false, error: message };
    }
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('user_display', JSON.stringify({ username: updated.username, fullName: updated.fullName, role: updated.role }));
  };

  const register = async (data) => {
    try {
      await authApi.register(data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (_) {
      // bỏ qua lỗi mạng
    } finally {
      if (user) {
        localStorage.removeItem(`tour-wishlist_${user.id || user.username}`);
        localStorage.removeItem(`cart_${user.id || user.username}`);
      }
      localStorage.removeItem('user_display');
      localStorage.removeItem('cart');
      localStorage.removeItem('tour-wishlist');
      localStorage.removeItem('cart_guest');
      setUser(null);
    }
  };

  const isAdmin = () => {
    if (!user || !user.role) return false;
    const r = String(user.role).replace(/^ROLE_/, '').trim().toUpperCase();
    return r === 'ADMIN' || r.includes('ADMIN');
  };

  const isStaff = () => {
    if (!user || !user.role) return false;
    const r = String(user.role).replace(/^ROLE_/, '').trim().toUpperCase();
    return r === 'ADMIN' || r.includes('ADMIN') || r === 'PROVIDER' || r.includes('PROVIDER');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    updateUser,
    register,
    logout,
    isAdmin,
    isStaff,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
