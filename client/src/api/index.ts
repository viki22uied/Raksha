import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raksha_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('raksha_token');
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Tourists
export const touristAPI = {
  getAll: (page = 1, limit = 20) => api.get(`/tourists?page=${page}&limit=${limit}`),
  getById: (id: string) => api.get(`/tourists/${id}`),
  update: (id: string, data: any) => api.put(`/tourists/${id}`, data),
  getEmergencyPacket: (id: string) => api.get(`/tourists/${id}/emergency-packet`),
};

// Locations
export const locationAPI = {
  ping: (data: any) => api.post('/locations/ping', data),
  batch: (data: any) => api.post('/locations/batch', data),
  getLatest: (touristId: string) => api.get(`/locations/latest/${touristId}`),
  getHistory: (touristId: string, params?: any) => api.get(`/locations/history/${touristId}`, { params }),
};

// Geofences
export const geofenceAPI = {
  getAll: (active?: boolean) => api.get(`/geofences${active ? '?active=true' : ''}`),
  getById: (id: string) => api.get(`/geofences/${id}`),
  create: (data: any) => api.post('/geofences', data),
  update: (id: string, data: any) => api.put(`/geofences/${id}`, data),
  delete: (id: string) => api.delete(`/geofences/${id}`),
  check: (lat: number, lng: number) => api.post('/geofences/check', { lat, lng }),
};

// SOS
export const sosAPI = {
  trigger: (data: any) => api.post('/sos/trigger', data),
  getEvents: (params?: any) => api.get('/sos/events', { params }),
};

// Alerts
export const alertAPI = {
  getAll: (params?: any) => api.get('/alerts', { params }),
  getById: (id: string) => api.get(`/alerts/${id}`),
  acknowledge: (id: string) => api.post(`/alerts/${id}/acknowledge`),
  assign: (id: string, data: any) => api.post(`/alerts/${id}/assign`, data),
  escalate: (id: string) => api.post(`/alerts/${id}/escalate`),
  resolve: (id: string, data?: any) => api.post(`/alerts/${id}/resolve`, data),
};

// Analytics
export const analyticsAPI = {
  getRealtime: () => api.get('/analytics/realtime'),
  getHistorical: (params?: any) => api.get('/analytics/historical', { params }),
  getOverview: () => api.get('/analytics/overview'),
  getZones: () => api.get('/analytics/zones'),
  getAlerts: () => api.get('/analytics/alerts'),
  getBehavior: () => api.get('/analytics/behavior'),
  getPerformance: () => api.get('/analytics/performance'),
};

// Identity
export const identityAPI = {
  create: (data: any) => api.post('/identity/create', data),
  upload: (file: File, documentType: string) => {
    const fd = new FormData();
    fd.append('document', file);
    fd.append('documentType', documentType);
    return api.post('/identity/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getDocuments: (touristId: string) => api.get(`/identity/${touristId}`),
  verify: (touristId: string, data: any) => api.post(`/identity/${touristId}/verify`, data),
  getEmergencyPacket: (touristId: string) => api.get(`/identity/${touristId}/emergency-packet`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLiveTourists: () => api.get('/admin/tourists/live'),
  getResponders: () => api.get('/admin/responders'),
  getAudit: (params?: any) => api.get('/admin/audit', { params }),
  exportData: (type: string, format = 'json') => api.get(`/admin/export?type=${type}&format=${format}`),
  assignResponder: (data: any) => api.post('/admin/assign-responder', data),
  recomputeAnalytics: () => api.post('/admin/recompute-analytics'),
};

// Health
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
