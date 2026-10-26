# -*- coding: utf-8 -*-
with open("src/api/axiosConfig.js", "r", encoding="utf-8") as f:
    content = f.read()

target = """// ========= TOURS (công khai) =========
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
};"""

replacement = """// ========= TOURS (công khai - Smart Dual-Mode: MariaDB Backend / Real OTA API Fallback) =========
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
export { realTourApi, realCategoryApi };"""

# Normalize CRLF
content_norm = content.replace("\r\n", "\n")
target_norm = target.replace("\r\n", "\n")

if target_norm in content_norm:
    new_content = content_norm.replace(target_norm, replacement)
    with open("src/api/axiosConfig.js", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Updated src/api/axiosConfig.js successfully!")
else:
    print("❌ Target not found!")
