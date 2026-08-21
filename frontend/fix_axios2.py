with open('src/api/axiosConfig.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'export const adminApi = \{.*?^\};', 
    '''export const adminApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    // Tours
    getTours: () => api.get('/admin/tours'),
    getTourById: (id) => api.get(/admin/tours/),
    createTour: (data) => api.post('/admin/tours', data),
    updateTour: (id, data) => api.put(/admin/tours/, data),
    deleteTour: (id) => api.delete(/admin/tours/),
    // Categories
    getCategories: () => api.get('/admin/categories'),
    getCategoryById: (id) => api.get(/admin/categories/),
    createCategory: (data) => api.post('/admin/categories', data),
    updateCategory: (id, data) => api.put(/admin/categories/, data),
    deleteCategory: (id) => api.delete(/admin/categories/),
    // Users
    getUsers: () => api.get('/admin/users'),
    getUserById: (id) => api.get(/admin/users/),
    updateUser: (id, data) => api.put(/admin/users/, data),
    deleteUser: (id) => api.delete(/admin/users/),
    // Orders
    getOrders: (page = 0, size = 10) => api.get(/admin/orders?page=0&size=100),
    getOrderById: (id) => api.get(/admin/orders/),
    updateOrderStatus: (id, status) => api.put(/admin/orders//status?status=),
    updateOrderDetail: (orderId, detailId, quantity) => api.put(/admin/orders//details//quantity?quantity=)
};''', content, flags=re.DOTALL | re.MULTILINE)

with open('src/api/axiosConfig.js', 'w', encoding='utf-8') as f:
    f.write(content)
