import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const tourApi = {
  getAll: () => api.get('/tours'),
  getById: (id) => api.get('/tours/' + id),
  search: (keyword) => api.get('/tours/search?keyword=' + keyword),
  getByCategory: (categoryId) => api.get('/tours/category/' + categoryId),
  filter: (params) => api.get('/tours/filter', { params }),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get('/categories/' + id),
};

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get('/orders/' + id),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Tours
  getTours: () => api.get('/admin/tours'),
  getTourById: (id) => api.get('/admin/tours/' + id),
  createTour: (data) => api.post('/admin/tours', data),
  updateTour: (id, data) => api.put('/admin/tours/' + id, data),
  deleteTour: (id) => api.delete('/admin/tours/' + id),
  // Categories
  getCategories: () => api.get('/admin/categories'),
  getCategoryById: (id) => api.get('/admin/categories/' + id),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put('/admin/categories/' + id, data),
  deleteCategory: (id) => api.delete('/admin/categories/' + id),
  // Users
  getUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get('/admin/users/' + id),
  updateUser: (id, data) => api.put('/admin/users/' + id, data),
  deleteUser: (id) => api.delete('/admin/users/' + id),
  // Orders
  getOrders: (page = 0, size = 10) => api.get('/admin/orders?page=0&size=100'),
  getOrderById: (id) => api.get('/admin/orders/' + id),
  updateOrderStatus: (id, status) => api.put('/admin/orders/' + id + '/status?status=' + status),
  updateOrderDetail: (orderId, detailId, quantity) => api.put('/admin/orders/' + orderId + '/details/' + detailId + '/quantity?quantity=' + quantity)
};

export default api;