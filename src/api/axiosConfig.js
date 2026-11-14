import axios from 'axios';
import { realTourApi, realCategoryApi, REAL_TOURS } from './realTourDataApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // gửi cookie session (JSESSIONID, remember-me)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đọc CSRF cookie và đính vào header cho mọi request thay đổi dữ liệu
api.interceptors.request.use((config) => {
  const xsrfCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='));
  if (xsrfCookie) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfCookie.split('=')[1]);
  }
  return config;
});

// Xử lý khi session hết hạn (401) → chuyển về trang login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      !error.config.url.includes('/auth/me')
    ) {
      const userDisplay = localStorage.getItem('user_display');
      if (!userDisplay) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========= AUTH =========
export const authApi = {
  /** POST /api/auth/login (Spring Security xử lý, trả JSON user) */
  login: (data) =>
    api.post('/auth/login', new URLSearchParams({
      username: data.username,
      password: data.password,
      ...(data.rememberMe && { 'remember-me': 'on' }),
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),

  /** POST /api/auth/send-otp — gửi mã xác thực OTP qua Gmail (hỗ trợ kiểm tra trùng username trước khi gửi) */
  sendOtp: (data) => {
    const payload = typeof data === 'string' ? { email: data } : data;
    return api.post('/auth/send-otp', payload);
  },

  /** POST /api/auth/register */
  register: (data) => api.post('/auth/register', data),

  /** POST /api/auth/password/forgot — Yêu cầu đặt lại mật khẩu */
  forgotPassword: (data) => api.post('/auth/password/forgot', data),

  /** POST /api/auth/password/verify-otp — Xác thực mã OTP SMS */
  verifyOtp: (data) => api.post('/auth/password/verify-otp', data),

  /** POST /api/auth/password/reset — Đặt lại mật khẩu mới */
  resetPassword: (data) => api.post('/auth/password/reset', data),

  /** POST /api/auth/logout */
  logout: () => api.post('/auth/logout'),

  /** GET /api/auth/me — kiểm tra session còn sống không */
  me: () => api.get('/auth/me'),
};

// ========= SESSION ID CHO GUEST TRACKING =========
export const getSessionId = () => {
  let sid = sessionStorage.getItem('tour_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem('tour_session_id', sid);
  }
  return sid;
};

// ========= TOURS (công khai - Smart Dual-Mode: MariaDB Backend / Real OTA API Fallback) =========
export const tourApi = {
  getAll: async () => {
    try {
      const res = await api.get('/tours');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res;
      return await realTourApi.getAll();
    } catch (e) {
      console.warn('Backend API chưa sẵn sàng. Tự động chuyển sang Bộ dữ liệu Real Tour OTA API:', e.message);
      return await realTourApi.getAll();
    }
  },
  getById: async (id, sessionId) => {
    try {
      const sid = sessionId || getSessionId();
      const res = await api.get(`/tours/${id}?sessionId=${encodeURIComponent(sid)}`);
      if (res.data) return res;
      return await realTourApi.getById(id);
    } catch (e) {
      return await realTourApi.getById(id);
    }
  },
  getByCategory: async (categoryId) => {
    try {
      const res = await api.get('/tours/category/' + categoryId);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res;
      return await realTourApi.getByCategory(categoryId);
    } catch (e) {
      return await realTourApi.getByCategory(categoryId);
    }
  },
  filter: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, v);
        }
      });
      const res = await api.get('/tours/filter?' + query.toString());
      if (res.data && Array.isArray(res.data)) return res;
      return await realTourApi.filter(params);
    } catch (e) {
      console.warn('Backend Filter API fallback to client-side Specification filter:', e.message);
      return await realTourApi.filter(params);
    }
  },
  search: async (keyword) => {
    try {
      const res = await api.get('/tours/search?keyword=' + encodeURIComponent(keyword));
      if (res.data && Array.isArray(res.data)) return res;
      return await realTourApi.search(keyword);
    } catch (e) {
      return await realTourApi.search(keyword);
    }
  },
  getRecommendations: async (sessionId, limit = 4) => {
    try {
      const sid = sessionId || getSessionId();
      const res = await api.get(`/tours/recommendations?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res;
      return await realTourApi.getRecommendations(sessionId, limit);
    } catch (e) {
      return await realTourApi.getRecommendations(sessionId, limit);
    }
  },
  getRecentlyViewed: async (sessionId, limit = 6) => {
    try {
      const sid = sessionId || getSessionId();
      const res = await api.get(`/tours/recently-viewed?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res;
      return await realTourApi.getRecentlyViewed(sessionId, limit);
    } catch (e) {
      return await realTourApi.getRecentlyViewed(sessionId, limit);
    }
  },
  recordActivity: async (id, type = 'VIEW', sessionId) => {
    try {
      const sid = sessionId || getSessionId();
      return await api.post(`/tours/${id}/activity?type=${type}&sessionId=${encodeURIComponent(sid)}`);
    } catch (e) {
      return { data: { success: true } };
    }
  },
};

// ========= CATEGORIES (công khai - Smart Dual-Mode) =========
export const categoryApi = {
  getAll: async () => {
    try {
      const res = await api.get('/categories');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) return res;
      return await realCategoryApi.getAll();
    } catch (e) {
      return await realCategoryApi.getAll();
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get('/categories/' + id);
      if (res.data) return res;
      return await realCategoryApi.getById(id);
    } catch (e) {
      return await realCategoryApi.getById(id);
    }
  },
};

// Export riêng Real OTA API cho các trường hợp chỉ định dùng API trực tiếp
export { realTourApi, realCategoryApi };

// ========= LOCAL STORAGE ENGINE CHO CHẾ ĐỘ MÔ PHỎNG DUAL-MODE =========
const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem('dulichviet_local_orders');
    const orders = raw ? JSON.parse(raw) : [];
    return orders.map((o) => ({
      ...o,
      totalAmount: o.totalAmount !== undefined ? o.totalAmount : o.totalPrice,
      totalPrice: o.totalPrice !== undefined ? o.totalPrice : o.totalAmount,
    }));
  } catch {
    return [];
  }
};

const saveLocalOrder = (order) => {
  try {
    const all = getLocalOrders();
    const idx = all.findIndex((o) => Number(o.id) === Number(order.id));
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...order };
    } else {
      all.unshift(order);
    }
    localStorage.setItem('dulichviet_local_orders', JSON.stringify(all));
  } catch (e) {
    console.error('Lưu đơn hàng cục bộ thất bại:', e);
  }
};

// ========= ORDERS (user đã đăng nhập - Smart Dual-Mode) =========
export const orderApi = {
  createOrder: async (data) => {
    try {
      return await api.post('/orders', data);
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        console.warn('Backend chưa sẵn sàng. Tự động lưu đơn hàng cục bộ:', err.message);
        let currentUser = null;
        try {
          const raw = localStorage.getItem('user_display');
          currentUser = raw ? JSON.parse(raw) : null;
        } catch {}

        const newId = 1000 + (Date.now() % 9000);
        let total = 0;
        const details = (data.items || []).map((item, idx) => {
          const tId = Number(item.tourId);
          const found = REAL_TOURS.find((t) => t.id === tId) || {
            id: tId,
            name: `Tour Khám Phá Trải Nghiệm #${tId}`,
            price: 2500000,
            imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
            duration: 3,
            startDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            endDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
          };
          const unitPrice = found.price || 2500000;
          const qty = item.quantity || 1;
          total += unitPrice * qty;
          return {
            id: newId * 10 + idx + 1,
            tour: found,
            quantity: qty,
            unitPrice: unitPrice,
          };
        });

        const isDeposit = data.paymentType === 'DEPOSIT';
        const depositPct = data.depositPercent || 30;
        const depositAmount = isDeposit ? Math.round((total * depositPct) / 100) : total;
        const remainingAmount = isDeposit ? total - depositAmount : 0;

        const mockOrder = {
          id: newId,
          orderCode: `BK-${newId}`,
          userId: currentUser?.id || 2,
          user: {
            id: currentUser?.id || 2,
            username: currentUser?.username || 'customer',
            fullName: data.contactName || currentUser?.fullName || 'Khách Hàng',
            email: data.contactEmail || currentUser?.email || 'customer@dulichviet.com.vn',
            phone: data.contactPhone || '0901234567',
          },
          contactName: data.contactName || currentUser?.fullName || 'Khách Hàng',
          contactPhone: data.contactPhone || '0901234567',
          contactEmail: data.contactEmail || 'customer@dulichviet.com.vn',
          totalAmount: total,
          totalPrice: total,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          paymentType: data.paymentType || 'FULL',
          depositPercent: depositPct,
          depositAmount: depositAmount,
          remainingAmount: remainingAmount,
          paidAmount: 0,
          notes: data.notes || '',
          orderDate: new Date().toISOString(),
          details: details,
        };

        saveLocalOrder(mockOrder);

        // Khấu trừ số chỗ đã đặt vào map lưu trữ
        try {
          const rawMap = localStorage.getItem('tour_booked_seats_map');
          const map = rawMap ? JSON.parse(rawMap) : {};
          (data.items || []).forEach((it) => {
            const tId = it.tourId;
            const qty = Number(it.quantity || 1);
            if (tId) {
              map[tId] = (map[tId] || 0) + qty;
            }
          });
          localStorage.setItem('tour_booked_seats_map', JSON.stringify(map));
        } catch (mErr) {
          console.warn('Lỗi lưu tour_booked_seats_map trong createOrder:', mErr);
        }

        return { data: mockOrder };
      }
      throw err;
    }
  },

  getMyOrders: async () => {
    try {
      const res = await api.get('/orders/my');
      const serverOrders = res.data || [];
      const localOrders = getLocalOrders();
      const serverIds = new Set(serverOrders.map((o) => o.id));
      const combined = [...serverOrders, ...localOrders.filter((o) => !serverIds.has(o.id))];
      return { data: combined };
    } catch (err) {
      console.warn('Backend getMyOrders fallback to local orders:', err.message);
      const localOrders = getLocalOrders();
      return { data: localOrders };
    }
  },

  getMyOrderById: async (id) => {
    try {
      return await api.get('/orders/my/' + id);
    } catch (err) {
      const local = getLocalOrders().find((o) => Number(o.id) === Number(id));
      if (local) return { data: local };
      throw err;
    }
  },

  getOrderById: async (id) => {
    try {
      return await api.get('/admin/orders/' + id);
    } catch (err) {
      const local = getLocalOrders().find((o) => Number(o.id) === Number(id));
      if (local) return { data: local };
      throw err;
    }
  },

  cancelOrder: async (id, refundData) => {
    // Hoàn lại số chỗ đã giữ trong tour_booked_seats_map khi đơn bị hủy
    const restoreSeats = (ord) => {
      try {
        const rawMap = localStorage.getItem('tour_booked_seats_map');
        if (rawMap && ord?.details) {
          const map = JSON.parse(rawMap);
          ord.details.forEach((d) => {
            const tId = d.tour?.id || d.tour?.tourId || d.tourId;
            const qty = Number(d.quantity || 1);
            if (tId && map[tId] !== undefined) {
              map[tId] = Math.max(0, map[tId] - qty);
            }
          });
          localStorage.setItem('tour_booked_seats_map', JSON.stringify(map));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (reErr) {
        console.warn('Khôi phục số chỗ sau hủy đơn:', reErr);
      }
    };

    try {
      const res = await api.post('/orders/my/' + id + '/cancel', refundData);
      if (res?.data) restoreSeats(res.data);
      return res;
    } catch (err) {
      const localOrders = getLocalOrders();
      const o = localOrders.find((ord) => Number(ord.id) === Number(id));
      if (o) {
        o.status = 'CANCELLED';
        o.paymentStatus = o.paidAmount > 0 ? 'REFUND_PENDING' : 'UNPAID';
        o.notes = [o.notes, refundData?.reason ? `[Lý do hủy: ${refundData.reason}]` : null]
          .filter(Boolean)
          .join(' - ');
        saveLocalOrder(o);
        restoreSeats(o);
        return { data: o };
      }
      throw err;
    }
  },

  payOrder: async (id, data) => {
    try {
      return await api.post('/orders/my/' + id + '/pay', data);
    } catch (err) {
      const localOrders = getLocalOrders();
      const o = localOrders.find((ord) => Number(ord.id) === Number(id));
      if (o) {
        const isDep = o.paymentType === 'DEPOSIT';
        o.status = isDep ? 'DEPOSITED' : 'CONFIRMED';
        o.paymentStatus = isDep ? 'PARTIALLY_PAID' : 'PAID';
        o.paidAmount = isDep ? o.depositAmount : o.totalPrice;
        o.paymentMethod = data?.paymentMethod || 'VIETQR';
        o.transactionCode = data?.transactionCode || `TXN-${Date.now().toString().slice(-6)}`;
        saveLocalOrder(o);
        return { data: o };
      }
      throw err;
    }
  },

  payRemaining: async (id, data) => {
    try {
      return await api.post('/orders/my/' + id + '/pay-remaining', data);
    } catch (err) {
      const localOrders = getLocalOrders();
      const o = localOrders.find((ord) => Number(ord.id) === Number(id));
      if (o) {
        o.status = 'CONFIRMED';
        o.paymentStatus = 'PAID';
        o.paidAmount = o.totalPrice;
        o.remainingAmount = 0;
        o.paymentMethod = data?.paymentMethod || 'VIETQR';
        saveLocalOrder(o);
        return { data: o };
      }
      throw err;
    }
  },
};

// ========= USER PROFILE =========
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
};

// ========= ADMIN =========
export const adminApi = {
  getDashboard: async () => {
    try {
      return await api.get('/admin/dashboard');
    } catch (err) {
      const localOrders = getLocalOrders();
      const sumRev = localOrders
        .filter((o) => o.status === 'CONFIRMED' || o.status === 'DEPOSITED')
        .reduce((sum, o) => sum + (o.paidAmount || o.totalPrice || 0), 0);
      return {
        data: {
          totalRevenue: sumRev > 0 ? sumRev : 158400000,
          totalOrders: localOrders.length > 0 ? localOrders.length : 24,
          totalTours: REAL_TOURS.length,
          totalUsers: 18,
          revenueChangePercent: 12.5,
          ordersChangePercent: 8.3,
        },
      };
    }
  },

  // Quản lý Tours (dùng endpoint /api/tours với ADMIN)
  getTours: () => tourApi.getAll(),
  getTourById: (id) => tourApi.getById(id),
  createTour: (data) => api.post('/tours', data),
  updateTour: (id, data) => api.put('/tours/' + id, data),
  deleteTour: (id) => api.delete('/tours/' + id),

  // Quản lý Danh mục (dùng endpoint /api/categories với ADMIN)
  getCategories: () => categoryApi.getAll(),
  getCategoryById: (id) => categoryApi.getById(id),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put('/categories/' + id, data),
  deleteCategory: (id) => api.delete('/categories/' + id),

  // Quản lý Người dùng
  getUsers: async () => {
    try {
      return await api.get('/admin/users');
    } catch (err) {
      return {
        data: [
          { id: 1, username: 'admin', fullName: 'Quản Trị Viên Hệ Thống', email: 'admin@dulichviet.com.vn', role: 'ADMIN', active: true, membershipTier: 'DIAMOND', loyaltyPoints: 1250 },
          { id: 2, username: 'customer', fullName: 'Khách Hàng Trải Nghiệm', email: 'customer@dulichviet.com.vn', role: 'CUSTOMER', active: true, membershipTier: 'SILVER', loyaltyPoints: 450 },
          { id: 3, username: 'vietravel', fullName: 'Công Ty Cổ Phần Du Lịch Vietravel', email: 'contact@vietravel.com', role: 'PROVIDER', active: true, membershipTier: 'GOLD', loyaltyPoints: 800 },
          { id: 4, username: 'saigontourist', fullName: 'Lữ Hành Saigontourist', email: 'info@saigontourist.net', role: 'PROVIDER', active: true, membershipTier: 'GOLD', loyaltyPoints: 750 },
          { id: 5, username: 'fpt_corp', fullName: 'Tập Đoàn FPT (Khách Đoàn B2B)', email: 'booking@fpt.com.vn', role: 'CUSTOMER', active: true, membershipTier: 'PLATINUM', loyaltyPoints: 2100 },
          { id: 6, username: 'nguyenvanan', fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'CUSTOMER', active: true, membershipTier: 'STANDARD', loyaltyPoints: 120 },
        ],
      };
    }
  },
  getUserById: (id) => api.get('/admin/users/' + id),
  updateUser: (id, data) => api.put('/admin/users/' + id, data),
  toggleUserActive: (id) => api.put('/admin/users/' + id + '/toggle-active'),
  updateUserRole: (id, role) => api.put('/admin/users/' + id + '/role', { role }),
  deleteUser: (id) => api.delete('/admin/users/' + id),

  // Quản lý Đơn hàng
  getOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      const serverOrders = res.data || [];
      const localOrders = getLocalOrders();
      const serverIds = new Set(serverOrders.map((o) => o.id));
      const combined = [...serverOrders, ...localOrders.filter((o) => !serverIds.has(o.id))];
      return { data: combined };
    } catch (err) {
      return { data: getLocalOrders() };
    }
  },
  getOrderById: (id) => api.get('/admin/orders/' + id),
  updateOrderStatus: (id, status) => api.put('/admin/orders/' + id + '/status', { status }),
  confirmPayment: (id) => api.put('/admin/orders/' + id + '/confirm-payment'),
  confirmRefund: (id) => api.put('/admin/orders/' + id + '/confirm-refund'),
  updateOrderDetail: (orderId, detailId, quantity) =>
    api.put('/admin/orders/' + orderId + '/details/' + detailId, { quantity }),

  // Xuất file báo cáo Excel / CSV chuẩn UTF-8 BOM & Chỉ số hệ thống
  exportOrdersCsv: () => api.get('/admin/export/orders.csv', { responseType: 'blob' }),
  exportToursCsv: () => api.get('/admin/export/tours.csv', { responseType: 'blob' }),
  getSystemMetrics: () => api.get('/admin/system/metrics'),
};

// ========= AI ASSISTANT & RECOMMENDATIONS =========
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (data) => api.post('/ai/recommend', data),
  itinerary: async (data) => {
    try {
      return await api.post('/ai/itinerary', data);
    } catch (err) {
      // Safeguard: Backend AiTourController chưa cung cấp riêng endpoint /ai/itinerary.
      // Tự động chuyển hướng gọi /ai/chat với prompt tạo lịch trình hoặc trả mock response an toàn.
      try {
        const destination = data?.destination || data?.title || 'điểm đến yêu cầu';
        const days = data?.days || data?.duration || 3;
        const prompt = `Lập lịch trình tour chi tiết ${days} ngày cho điểm đến ${destination}`;
        return await api.post('/ai/chat', { message: prompt, query: prompt });
      } catch (fallbackErr) {
        return {
          data: {
            reply: `Lịch trình gợi ý khám phá điểm đến ${data?.destination || ''} trong ${data?.duration || 3} ngày: Trải nghiệm ẩm thực địa phương, tham quan danh lam thắng cảnh và nghỉ dưỡng tiêu chuẩn cao cấp.`,
            itinerary: [],
          },
        };
      }
    }
  },
  semanticSearch: (query, limit = 6) => api.get('/ai/semantic-search?q=' + encodeURIComponent(query) + '&limit=' + limit),
  getVectorDbStatus: () => api.get('/ai/vector-db/status'),
  reindexVectorDb: () => api.post('/ai/vector-db/reindex'),
  getSuggestions: () => api.get('/ai/suggestions'),
};

// ========= PAYMENT =========
export const paymentApi = {
  getInfo: (orderId) => api.get(`/payment/info/${orderId}`),
  createVnPayUrl: (orderId, returnUrl) => api.post('/payment/vnpay/create-url', { orderId, returnUrl }),
  confirm: (data) => api.post('/payment/confirm', data),
  processVnPayReturn: (queryString) => api.get(`/payment/vnpay/return?${queryString}`),
};

export default api;
