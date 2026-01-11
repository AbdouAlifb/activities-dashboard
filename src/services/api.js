import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token storage
let csrfToken = null;

// Get CSRF token
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/auth/csrf-token');
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add CSRF token to mutating requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    // Add access token from localStorage if available
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data.data;
        
        // Store new access token
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // If CSRF token error, refetch and retry
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      csrfToken = null;
      await fetchCsrfToken();
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  refreshToken: () => api.post('/auth/refresh'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (timeRange = '30') => api.get('/dashboard/stats', { params: { timeRange } }),
};

// Agency Payouts API
export const agencyPayoutsAPI = {
  getSummary: (params) => api.get('/agency-payouts/summary', { params }),
  getAgencyDetails: (agencyId, params) => api.get(`/agency-payouts/agency/${agencyId}`, { params }),
  markAsPaid: (agencyId, data) => api.post(`/agency-payouts/agency/${agencyId}/mark-paid`, data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, data) => api.put(`/users/${id}/password`, data),
  delete: (id) => api.delete(`/users/${id}`),
  unlock: (id) => api.post(`/users/${id}/unlock`),
};

// Roles API
export const rolesAPI = {
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: (id) => api.get(`/roles/${id}/permissions`),
  setPermissions: (id, menuItemIds) => api.put(`/roles/${id}/permissions`, { menuItemIds }),
};

// Menus API
export const menusAPI = {
  getMyMenu: () => api.get('/menus/my-menu'),
  getAll: () => api.get('/menus'),
  getHierarchy: () => api.get('/menus/hierarchy'),
  getById: (id) => api.get(`/menus/${id}`),
  create: (data) => api.post('/menus', data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  delete: (id) => api.delete(`/menus/${id}`),
  setRoleAccess: (id, roleIds) => api.put(`/menus/${id}/access`, { roleIds }),
};

// ============== PLATFORM APIs ==============

// Countries API
export const countriesAPI = {
  getAll: (params) => api.get('/countries', { params }),
  getActive: () => api.get('/countries/active'),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => api.post('/countries', data),
  update: (id, data) => api.put(`/countries/${id}`, data),
  delete: (id) => api.delete(`/countries/${id}`),
};

// Cities API
export const citiesAPI = {
  getAll: (params) => api.get('/cities', { params }),
  getActive: () => api.get('/cities/active'),
  getByCountry: (countryId) => api.get(`/cities/country/${countryId}`),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getActive: () => api.get('/categories/active'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Activities API
export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getFeatured: (limit) => api.get('/activities/featured', { params: { limit } }),
  getByCity: (cityId) => api.get(`/activities/city/${cityId}`),
  getBySlug: (slug) => api.get(`/activities/slug/${slug}`),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  toggleFeatured: (id) => api.patch(`/activities/${id}/toggle-featured`),
  delete: (id) => api.delete(`/activities/${id}`),
};

// Agencies API
export const agenciesAPI = {
  // Super Admin
  getAll: (params) => api.get('/agencies', { params }),
  getById: (id) => api.get(`/agencies/${id}`),
  create: (data) => api.post('/agencies', data),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  toggleVerified: (id) => api.patch(`/agencies/${id}/toggle-verified`),
  delete: (id) => api.delete(`/agencies/${id}`),
  getActivities: (id) => api.get(`/agencies/${id}/activities`),
  addActivity: (id, data) => api.post(`/agencies/${id}/activities`, data),
  updateActivity: (id, activityId, data) => api.put(`/agencies/${id}/activities/${activityId}`, data),
  removeActivity: (id, activityId) => api.delete(`/agencies/${id}/activities/${activityId}`),
  getStats: (id) => api.get(`/agencies/${id}/stats`),
  
  // Agency Admin (my agency)
  getMyAgency: () => api.get('/agencies/my-agency'),
  updateMyAgency: (data) => api.put('/agencies/my-agency', data),
  getMyActivities: () => api.get('/agencies/my-activities'),
  getAvailableActivities: (params) => api.get('/agencies/available-activities', { params }),
  addMyActivity: (data) => api.post('/agencies/my-activities', data),
  updateMyActivity: (activityId, data) => api.put(`/agencies/my-activities/${activityId}`, data),
  removeMyActivity: (activityId) => api.delete(`/agencies/my-activities/${activityId}`),
};

// Reservations API
export const reservationsAPI = {
  // Super Admin
  getAll: (params) => api.get('/reservations', { params }),
  getStats: (params) => api.get('/reservations/stats/overview', { params }),
  updatePayment: (id, data) => api.put(`/reservations/${id}/payment`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  
  // Both
  getById: (id) => api.get(`/reservations/${id}`),
  confirm: (id, notes) => api.post(`/reservations/${id}/confirm`, { notes }),
  cancel: (id, reason) => api.post(`/reservations/${id}/cancel`, { reason }),
  complete: (id) => api.post(`/reservations/${id}/complete`),
  
  // Agency Admin
  getMyReservations: (params) => api.get('/reservations/my-reservations', { params }),
  getMyUpcoming: (limit) => api.get('/reservations/my-upcoming', { params: { limit } }),
  getMyStats: (params) => api.get('/reservations/my-stats', { params }),
  
  // Public
  create: (data) => api.post('/reservations', data),
  checkByReference: (referenceCode) => api.get(`/reservations/check/${referenceCode}`),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (type, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadMultiple: (type, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/upload/${type}/multiple`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (type, filename) => api.delete(`/upload/${type}/${filename}`),
};

export default api;
