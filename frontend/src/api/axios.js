import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
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

// ─── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// ─── Users ────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  search: (email) => api.get(`/users/search?email=${encodeURIComponent(email)}`),
};

// ─── Groups ───────────────────────────────────────────
export const groupAPI = {
  create: (data) => api.post('/groups', data),
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  addMember: (id, email) => api.post(`/groups/${id}/members`, { email }),
  removeMember: (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
  getBalances: (id) => api.get(`/groups/${id}/balances`),
};

// ─── Expenses ─────────────────────────────────────────
export const expenseAPI = {
  create: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),
  getByGroup: (groupId) => api.get(`/groups/${groupId}/expenses`),
  getById: (id) => api.get(`/expenses/${id}`),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ─── Settlements ──────────────────────────────────────
export const settlementAPI = {
  create: (groupId, data) => api.post(`/groups/${groupId}/settlements`, data),
  getByGroup: (groupId) => api.get(`/groups/${groupId}/settlements`),
};

// ─── Messages ─────────────────────────────────────────
export const messageAPI = {
  getByExpense: (expenseId) => api.get(`/expenses/${expenseId}/messages`),
};

export default api;
