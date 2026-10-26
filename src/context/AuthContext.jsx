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
        const { userId, username, email, role, fullName, phone, address } = res.data;
        const cleanRole = (role || '').replace(/^ROLE_/, '');
        setUser({ id: userId, username, email, role: cleanRole, fullName: fullName || username, phone: phone || '', address: address || '' });
      })
      .catch(() => {
        // Session đã hết hoặc chưa đăng nhập → giữ user = null
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      const { userId, username, email, role, fullName, phone, address } = response.data;
      const cleanRole = (role || '').replace(/^ROLE_/, '');
      const newUser = {
        id: userId,
        username,
        email,
        role: cleanRole,
        fullName: fullName || username,
        phone: phone || '',
        address: address || '',
      };
      setUser(newUser);
      // Lưu tên vào localStorage để hiển thị nhanh (không phải để xác thực)
      localStorage.setItem('user_display', JSON.stringify({ username, fullName: newUser.fullName, role: cleanRole }));
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
      } else if (
        status === 500 ||
        status === 502 || 
        status === 503 || 
        status === 504 || 
        error.code === 'ERR_NETWORK' || 
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') || 
        error.message?.includes('timeout') ||
        !error.response
      ) {
        message = 'Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng đảm bảo Spring Boot Backend đã được khởi động!';
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
    const r = user.role.replace(/^ROLE_/, '');
    return r === 'ADMIN';
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
