import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      // Dữ liệu đăng nhập trả về từ server bao gồm token và thông tin người dùng
      const { token: newToken, userId, username, email, role, fullName, phone, address } = response.data;
      const newUser = { 
        id: userId, 
        username, 
        email, 
        role, 
        fullName: fullName || username, 
        phone: phone || '', 
        address: address || '' 
      };
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', newToken);
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data || error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      return { success: false, error: message };
    }
  };

  // Cập nhật thông tin người dùng sau khi chỉnh sửa hồ sơ
  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  // Tiện ích chuyển đổi nhanh tài khoản demo (Quản trị viên hoặc Khách hàng)
  const switchDemoAccount = async (targetRole) => {
    const creds = targetRole === 'ADMIN' 
      ? { username: 'admin', password: '123' } 
      : { username: 'customer1', password: '123' };
    return await login(creds);
  };

  const register = async (data) => {
    try {
      await authApi.register(data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Đã đăng xuất');
  };

  const isAdmin = () => {
    return user && user.role === 'ADMIN';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    updateUser,
    switchDemoAccount,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
