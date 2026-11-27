import axios from 'axios';
import { realTourApi, realCategoryApi } from './realTourDataApi';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // gửi cookie session (JSESSIONID, remember-me)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đọc CSRF cookie và đính vào header cho mọi request thay đổi dữ liệu
const readCsrfCookie = () => document.cookie
  .split('; ')
  .find((row) => row.startsWith('XSRF-TOKEN='));

api.interceptors.request.use(async (config) => {
  const method = String(config.method || 'get').toLowerCase();
  const isWrite = ['post', 'put', 'patch', 'delete'].includes(method);
  let xsrfCookie = readCsrfCookie();
  if (isWrite && !xsrfCookie && !String(config.url || '').endsWith('/auth/csrf')) {
    try {
      await api.get('/auth/csrf');
      xsrfCookie = readCsrfCookie();
    } catch (_) {
      // The original request will surface the server error if CSRF bootstrap fails.
    }
  }
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
      !String(error.config?.url || '').includes('/auth/login') &&
      !String(error.config?.url || '').includes('/auth/me')
    ) {
      localStorage.removeItem('user_display');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
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

// ========= TOURS (backend is the source of bookable tours and inventory) =========
export const tourApi = {
  getAll: () => api.get('/tours'),
  getById: (id, sessionId) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/${id}?sessionId=${encodeURIComponent(sid)}`);
  },
  getByCategory: (categoryId) => api.get('/tours/category/' + categoryId),
  filter: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    return api.get('/tours/filter?' + query.toString());
  },
  search: (keyword) => api.get('/tours/search?keyword=' + encodeURIComponent(keyword)),
  getRecommendations: (sessionId, limit = 4) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/recommendations?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
  },
  getRecentlyViewed: (sessionId, limit = 6) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/recently-viewed?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
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

// ========= TOUR REVIEWS =========
export const reviewApi = {
  getByTour: (tourId) => api.get(`/tours/${tourId}/reviews`),
  getEligibility: (tourId) => api.get(`/tours/${tourId}/reviews/eligibility`),
  create: (tourId, data) => api.post(`/tours/${tourId}/reviews`, data),
};

// ========= CATEGORIES =========
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get('/categories/' + id),
};

// Export riêng Real OTA API cho các trường hợp chỉ định dùng API trực tiếp
export { realTourApi, realCategoryApi };

// ========= ORDERS (server-authoritative booking and payment state) =========
export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getMyOrderById: (id) => api.get('/orders/my/' + id),
  getOrderById: (id) => api.get('/admin/orders/' + id),
  cancelOrder: (id, refundData) => api.post('/orders/my/' + id + '/cancel', refundData),
  payOrder: (id, data) => api.post('/orders/my/' + id + '/pay', data),
  payRemaining: (id, data) => api.post('/orders/my/' + id + '/pay-remaining', data),
};

// ========= USER PROFILE =========
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  changePassword: (data) => api.put('/users/me/password', data),
};

// ========= ADMIN =========
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Quản lý Tours (dùng endpoint /api/tours với ADMIN, Smart Dual-Mode fallback)
  getTours: () => tourApi.getAll(),
  getTourById: (id) => tourApi.getById(id),
  createTour: (data) => api.post('/tours', data),
  updateTour: (id, data) => api.put('/tours/' + id, data),
  deleteTour: (id) => api.delete('/tours/' + id),

  // Quản lý Danh mục (dùng endpoint /api/categories với ADMIN, Smart Dual-Mode fallback)
  getCategories: () => categoryApi.getAll(),
  getCategoryById: (id) => categoryApi.getById(id),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put('/categories/' + id, data),
  deleteCategory: (id) => api.delete('/categories/' + id),
  toggleCategoryStatus: (id) => api.patch('/categories/' + id + '/status'),

  // Quản lý Người dùng
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get('/admin/users/' + id),
  updateUser: (id, data) => api.put('/admin/users/' + id, data),
  toggleUserActive: (id) => api.put('/admin/users/' + id + '/toggle-active'),
  updateUserRole: (id, role) => api.put('/admin/users/' + id + '/role', { role }),
  deleteUser: (id) => api.delete('/admin/users/' + id),

  // Quản lý Đơn hàng
  getOrders: () => api.get('/admin/orders'),
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
