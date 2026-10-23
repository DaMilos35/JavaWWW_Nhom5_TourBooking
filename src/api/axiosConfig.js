import axios from 'axios';

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
      localStorage.removeItem('user');
      window.location.href = '/login';
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

  /** POST /api/auth/register */
  register: (data) => api.post('/auth/register', data),

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

// ========= TOURS (công khai) =========
export const tourApi = {
  getAll: () => api.get('/tours'),
  getById: (id, sessionId) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/${id}?sessionId=${encodeURIComponent(sid)}`);
  },
  getByCategory: (categoryId) => api.get('/tours/category/' + categoryId),
  search: (keyword) => api.get('/tours/search?keyword=' + encodeURIComponent(keyword)),
  getRecommendations: (sessionId, limit = 4) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/recommendations?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
  },
  getRecentlyViewed: (sessionId, limit = 6) => {
    const sid = sessionId || getSessionId();
    return api.get(`/tours/recently-viewed?limit=${limit}&sessionId=${encodeURIComponent(sid)}`);
  },
  recordActivity: (id, type = 'VIEW', sessionId) => {
    const sid = sessionId || getSessionId();
    return api.post(`/tours/${id}/activity?type=${type}&sessionId=${encodeURIComponent(sid)}`);
  },
};

// ========= CATEGORIES (công khai) =========
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get('/categories/' + id),
};

// ========= ORDERS (user đã đăng nhập) =========
export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getMyOrderById: (id) => api.get('/orders/my/' + id),
  getOrderById: (id) => api.get('/admin/orders/' + id),
  cancelOrder: (id, refundData) => api.post('/orders/my/' + id + '/cancel', refundData),
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

  // Quản lý Tours (dùng endpoint /api/tours với ADMIN)
  getTours: () => api.get('/tours'),
  getTourById: (id) => api.get('/tours/' + id),
  createTour: (data) => api.post('/tours', data),
  updateTour: (id, data) => api.put('/tours/' + id, data),
  deleteTour: (id) => api.delete('/tours/' + id),

  // Quản lý Danh mục (dùng endpoint /api/categories với ADMIN)
  getCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get('/categories/' + id),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put('/categories/' + id, data),
  deleteCategory: (id) => api.delete('/categories/' + id),

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
};

// ========= AI ASSISTANT & RECOMMENDATIONS =========
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (data) => api.post('/ai/recommend', data),
  itinerary: (data) => api.post('/ai/itinerary', data),
};

// ========= PAYMENT =========
export const paymentApi = {
  getInfo: (orderId) => api.get(`/payment/info/${orderId}`),
  createVnPayUrl: (orderId, returnUrl) => api.post('/payment/vnpay/create-url', { orderId, returnUrl }),
  confirm: (data) => api.post('/payment/confirm', data),
  processVnPayReturn: (queryString) => api.get(`/payment/vnpay/return?${queryString}`),
};

export default api;
