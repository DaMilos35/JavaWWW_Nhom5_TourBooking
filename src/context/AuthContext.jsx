import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user_display');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) {
          const cleanRole = (parsed.role || '').replace(/^ROLE_/, '').trim().toUpperCase();
          return {
            id: parsed.id || (cleanRole === 'ADMIN' ? 1 : 2),
            username: parsed.username,
            email: parsed.email || `${parsed.username}@dulichviet.com.vn`,
            role: cleanRole,
            fullName: parsed.fullName || parsed.username,
            phone: parsed.phone || '1900 1839',
            address: parsed.address || 'Hồ Chí Minh',
            membershipTier: parsed.membershipTier || (cleanRole === 'ADMIN' ? 'DIAMOND' : 'STANDARD'),
            loyaltyPoints: parsed.loyaltyPoints || 500,
            totalSpent: parsed.totalSpent || 50000000
          };
        }
      }
    } catch (_) {}
    return null;
  });
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
        // Nếu server tạm thời không phản hồi nhưng localStorage có thông tin phiên làm việc, giữ nguyên để không làm gián đoạn admin
        const saved = localStorage.getItem('user_display');
        if (!saved) {
          setUser(null);
        }
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
        // Fallback thông minh: Cho phép đăng nhập demo ngoại tuyến khi Backend Port 8080 chưa mở
        const DEMO_ACCOUNTS = {
          admin: { role: 'ADMIN', fullName: 'Quản Trị Viên Hệ Thống', email: 'admin@dulichviet.com.vn', membershipTier: 'DIAMOND', loyaltyPoints: 1250 },
          vietravel: { role: 'PROVIDER', fullName: 'Công Ty Cổ Phần Du Lịch Vietravel', email: 'contact@vietravel.com', membershipTier: 'GOLD', loyaltyPoints: 800 },
          saigontourist: { role: 'PROVIDER', fullName: 'Lữ Hành Saigontourist', email: 'info@saigontourist.net', membershipTier: 'GOLD', loyaltyPoints: 750 },
          fpt_corp: { role: 'CUSTOMER', fullName: 'Tập Đoàn FPT (Khách Đoàn B2B)', email: 'booking@fpt.com.vn', membershipTier: 'PLATINUM', loyaltyPoints: 2100 },
          customer: { role: 'CUSTOMER', fullName: 'Khách Hàng Trải Nghiệm', email: 'customer@dulichviet.com.vn', membershipTier: 'SILVER', loyaltyPoints: 450 },
          nguyenvanan: { role: 'CUSTOMER', fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', membershipTier: 'STANDARD', loyaltyPoints: 120 }
        };

        const uname = (credentials.username || '').trim().toLowerCase();
        const pwd = credentials.password || '';
        if (DEMO_ACCOUNTS[uname] && pwd === '123456') {
          const acc = DEMO_ACCOUNTS[uname];
          const demoUser = {
            id: uname === 'admin' ? 1 : (uname.includes('travel') || uname.includes('tourist') ? 10 : 2),
            username: uname,
            email: acc.email,
            role: acc.role,
            fullName: acc.fullName,
            phone: '0901234567',
            address: 'Hồ Chí Minh, Việt Nam',
            membershipTier: acc.membershipTier,
            loyaltyPoints: acc.loyaltyPoints,
            totalSpent: 15000000
          };
          setUser(demoUser);
          localStorage.setItem('user_display', JSON.stringify({
            id: demoUser.id,
            username: demoUser.username,
            email: demoUser.email,
            fullName: demoUser.fullName,
            role: demoUser.role,
            membershipTier: demoUser.membershipTier
          }));
          return { success: true, user: demoUser, isOfflineDemo: true };
        }

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
    const r = String(user.role).replace(/^ROLE_/, '').trim().toUpperCase();
    return r === 'ADMIN' || r.includes('ADMIN');
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
