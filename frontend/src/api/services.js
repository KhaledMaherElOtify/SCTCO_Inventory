// API service functions

import api from './axiosInstance';

// ===== Auth Services =====
export const authApi = {
  login: (username, password) =>
    api.post('/api/auth/login', { username, password }),
  logout: () =>
    api.post('/api/auth/logout'),
  refresh: (refreshToken) =>
    api.post('/api/auth/refresh', { refreshToken }),
  getProfile: () =>
    api.get('/api/auth/profile'),
  changePassword: (currentPassword, newPassword) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }),
};

// ===== User Services =====
export const usersApi = {
  list: () => api.get('/api/users'),
  get: (id) => api.get(`/api/users/${id}`),
  create: (userData) => api.post('/api/users', userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  deactivate: (id) => api.post(`/api/users/${id}/deactivate`),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// ===== Product Services =====
export const productsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
    if (filters.search) params.append('search', filters.search);
    return api.get(`/api/products?${params.toString()}`);
  },
  get: (id) => api.get(`/api/products/${id}`),
  create: (productData) => api.post('/api/products', productData),
  update: (id, productData) => api.put(`/api/products/${id}`, productData),
  deactivate: (id) => api.post(`/api/products/${id}/deactivate`),
  lowStock: () => api.get('/api/products/low-stock'),
};

// ===== Category Services =====
export const categoriesApi = {
  list: () => api.get('/api/categories'),
  get: (id) => api.get(`/api/categories/${id}`),
  create: (categoryData) => api.post('/api/categories', categoryData),
  update: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// ===== Supplier Services =====
export const suppliersApi = {
  list: () => api.get('/api/suppliers'),
  get: (id) => api.get(`/api/suppliers/${id}`),
  create: (supplierData) => api.post('/api/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/api/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/api/suppliers/${id}`),
};

// ===== Stock Services =====
export const stockApi = {
  getSummary: () => api.get('/api/stock/summary'),
  getProductStock: (productId) => api.get(`/api/stock/product/${productId}`),
  getHistory: (productId, limit = 50, offset = 0) =>
    api.get(`/api/stock/product/${productId}/history?limit=${limit}&offset=${offset}`),
  getAllTransactions: (startDate, endDate, limit = 100, offset = 0) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    params.append('limit', limit);
    params.append('offset', offset);
    return api.get(`/api/stock/transactions/all?${params.toString()}`);
  },
  stockIn: (productId, quantity, referenceNumber, notes) =>
    api.post('/api/stock/in', {
      product_id: productId,
      quantity,
      reference_number: referenceNumber,
      notes,
    }),
  stockOut: (productId, quantity, referenceNumber, notes) =>
    api.post('/api/stock/out', {
      product_id: productId,
      quantity,
      reference_number: referenceNumber,
      notes,
    }),
  adjust: (productId, newQuantity, notes) =>
    api.post('/api/stock/adjust', {
      product_id: productId,
      new_quantity: newQuantity,
      notes,
    }),
};
