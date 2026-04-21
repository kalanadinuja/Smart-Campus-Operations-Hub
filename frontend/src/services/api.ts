import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

/** Axios instance with JWT interceptor */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by redirecting to login
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

// ==================== Auth ====================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/signin', { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post('/api/auth/signup', { name, email, password }),
  getMe: () => api.get('/api/auth/me'),
  getUsers: (search?: string, role?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (role && role !== 'ALL') params.role = role;
    return api.get('/api/auth/users', { params });
  },
  exportUsers: (search?: string, role?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (role && role !== 'ALL') params.role = role;
    return api.get('/api/auth/users/export', { params, responseType: 'blob' });
  },
  updateRole: (id: string, role: string) =>
    api.put(`/api/auth/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/api/auth/users/${id}`),
};

// ==================== Resources ====================
export const resourceApi = {
  getAll: (params?: any) => api.get('/api/resources', { params }),
  getById: (id: string) => api.get(`/api/resources/${id}`),
  create: (data: any) => api.post('/api/resources', data),
  update: (id: string, data: any) => api.put(`/api/resources/${id}`, data),
  delete: (id: string) => api.delete(`/api/resources/${id}`),
};

// ==================== Bookings ====================
export const bookingApi = {
  create: (data: any) => api.post('/api/bookings', data),
  getAll: (params?: any) => api.get('/api/bookings', { params }),
  getMine: () => api.get('/api/bookings/me'),
  getById: (id: string) => api.get(`/api/bookings/${id}`),
  approve: (id: string) => api.put(`/api/bookings/${id}/approve`),
  reject: (id: string, reason: string) =>
    api.put(`/api/bookings/${id}/reject`, { reason }),
  cancel: (id: string) => api.put(`/api/bookings/${id}/cancel`),
  getResourceBookings: (resourceId: string, start: string, end: string) =>
    api.get(`/api/bookings/resource/${resourceId}`, { params: { start, end } }),
};

// ==================== Tickets ====================
export const ticketApi = {
  create: (data: any) => api.post('/api/tickets', data),
  getAll: (params?: any) => api.get('/api/tickets', { params }),
  getMine: () => api.get('/api/tickets/me'),
  getAssigned: () => api.get('/api/tickets/assigned'),
  getById: (id: string) => api.get(`/api/tickets/${id}`),
  assign: (id: string, technicianId: string) =>
    api.put(`/api/tickets/${id}/assign`, { technicianId }),
  updateStatus: (id: string, status: string, resolutionNotes?: string) =>
    api.put(`/api/tickets/${id}/status`, { status, resolutionNotes }),
  reject: (id: string, reason: string) =>
    api.put(`/api/tickets/${id}/reject`, { reason }),
};

// ==================== Comments ====================
export const commentApi = {
  getByTicket: (ticketId: string) =>
    api.get(`/api/tickets/${ticketId}/comments`),
  create: (ticketId: string, text: string) =>
    api.post(`/api/tickets/${ticketId}/comments`, { text }),
  update: (id: string, text: string) =>
    api.put(`/api/comments/${id}`, { text }),
  delete: (id: string) => api.delete(`/api/comments/${id}`),
};

// ==================== Notifications ====================
export const notificationApi = {
  getAll: (params?: any) => api.get('/api/notifications', { params }),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markAsRead: (id: string) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
};

// ==================== Analytics ====================
export const analyticsApi = {
  get: () => api.get('/api/analytics'),
};

export default api;
