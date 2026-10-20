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
        setUser({ id: userId, username, email, role, fullName: fullName || username, phone: phone || '', address: address || '' });
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
      const newUser = {
        id: userId,
        username,
        email,
        role,
        fullName: fullName || username,
        phone: phone || '',
        address: address || '',
      };
      setUser(newUser);
      // Lưu tên vào localStorage để hiển thị nhanh (không phải để xác thực)
      localStorage.setItem('user_display', JSON.stringify({ username, fullName: newUser.fullName, role }));
      return { success: true, user: newUser };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
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
      setUser(null);
      localStorage.removeItem('user_display');
    }
  };

  const isAdmin = () => user?.role === 'ADMIN';

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
