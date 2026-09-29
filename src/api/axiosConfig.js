import axios from 'axios';

// Khởi tạo instance Axios kết nối tới API
const api = axios.create({
  baseURL: (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token JWT vào Header khi gửi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý khi token hết hạn (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !error.config.url.includes("/auth/login")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Xác thực (Đăng nhập / Đăng ký)
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// API Tour (Người dùng xem và tìm kiếm)
export const tourApi = {
  getAll: () => api.get('/tours'),
  getById: (id) => api.get('/tours/' + id),
  search: (keyword) => api.get('/tours/search?keyword=' + encodeURIComponent(keyword)),
  getByCategory: (categoryId) => api.get('/tours/category/' + categoryId),
  filter: (params) => api.get('/tours/filter', { params }),
};

// API Danh mục
export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get('/categories/' + id),
};

// API Đơn hàng của khách
export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get('/orders/' + id),
  cancelOrder: (id) => api.put('/orders/' + id + '/cancel'),
};

// API Thông tin cá nhân
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
};

// API Dành cho Quản trị viên (Admin)
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Quản lý Tours
  getTours: () => api.get('/admin/tours'),
  getTourById: (id) => api.get('/admin/tours/' + id),
  createTour: (data) => api.post('/admin/tours', data),
  updateTour: (id, data) => api.put('/admin/tours/' + id, data),
  deleteTour: (id) => api.delete('/admin/tours/' + id),
  toggleTourStatus: (id) => api.put('/admin/tours/' + id + '/toggle-status'),
  // Quản lý Danh mục
  getCategories: () => api.get('/admin/categories'),
  getCategoryById: (id) => api.get('/admin/categories/' + id),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put('/admin/categories/' + id, data),
  deleteCategory: (id) => api.delete('/admin/categories/' + id),
  // Quản lý Người dùng
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get('/admin/users/' + id),
  updateUser: (id, data) => api.put('/admin/users/' + id, data),
  deleteUser: (id) => api.delete('/admin/users/' + id),
  getUserOrders: (id) => api.get('/admin/users/' + id + '/orders'),
  // Quản lý Đơn hàng
  getOrders: (page = 0, size = 100) => api.get('/admin/orders?page=' + page + '&size=' + size),
  getOrderById: (id) => api.get('/admin/orders/' + id),
  updateOrderStatus: (id, status) => api.put('/admin/orders/' + id + '/status?status=' + status),
  updateOrderDetail: (orderId, detailId, quantity) => api.put('/admin/orders/' + orderId + '/details/' + detailId + '/quantity?quantity=' + quantity)
};

export default api;
