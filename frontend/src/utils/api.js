import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Request interceptor — attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Expenses
export const expenseAPI = {
  getAll: (params) => API.get('/expenses', { params }),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  bulkDelete: (ids) => API.delete('/expenses', { data: { ids } }),
  getMonthlySummary: (params) => API.get('/expenses/summary/monthly', { params }),
};

// Budgets
export const budgetAPI = {
  getAll: (params) => API.get('/budgets', { params }),
  create: (data) => API.post('/budgets', data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`),
};

// Goals
export const goalAPI = {
  getAll: () => API.get('/goals'),
  create: (data) => API.post('/goals', data),
  update: (id, data) => API.put(`/goals/${id}`, data),
  delete: (id) => API.delete(`/goals/${id}`),
  contribute: (id, data) => API.post(`/goals/${id}/contribute`, data),
};

// Analytics
export const analyticsAPI = {
  getOverview: () => API.get('/analytics/overview'),
  getTrend: (params) => API.get('/analytics/trend', { params }),
  getCategoryBreakdown: (params) => API.get('/analytics/category-breakdown', { params }),
  getDaily: (params) => API.get('/analytics/daily', { params }),
  getTopExpenses: (params) => API.get('/analytics/top-expenses', { params }),
  getPaymentMethods: () => API.get('/analytics/payment-methods'),
};

// Recurring
export const recurringAPI = {
  getAll: () => API.get('/recurring'),
  create: (data) => API.post('/recurring', data),
  update: (id, data) => API.put(`/recurring/${id}`, data),
  delete: (id) => API.delete(`/recurring/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
};

export default API;
