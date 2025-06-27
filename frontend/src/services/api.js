import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors and attempt to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenHelper.getRefreshToken();
        if (!refreshToken) {
          tokenHelper.clearAuth();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        tokenHelper.setTokens(accessToken, newRefreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        tokenHelper.clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Check if Super Admin exists
  checkSuperAdminExists: () => api.get('/auth/check-super-admin'),
  
  // Super Admin registration with OTP
  registerSuperAdmin: (userData) => api.post('/auth/register', userData),
  
  // Verify registration OTP and complete Super Admin setup
  verifySuperAdminOTP: (data) => api.post('/auth/verify-registration-otp', data),
  
  // Account activation for newly created users
  activateAccount: (data) => api.post('/auth/activate-account', data),
  
  // Send account activation OTP for existing users
  sendActivationOTP: (data) => api.post('/auth/send-activation-otp', data),
  
  // Universal login for all user types
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Forgot password - send OTP
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  
  // Reset password with OTP
  resetPassword: (data) => api.post('/auth/reset-password', data),
  
  // Refresh access token
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  
  // Logout
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  
  // Validate token
  validateToken: (token) => api.post('/auth/validate-token', { token }),
  
  // Generate project-specific token for redirection
  generateProjectToken: (customProjectId) => api.post(`/auth/project-token/${customProjectId}`),
};

// Project API endpoints
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (customProjectId, data) => api.put(`/projects/${customProjectId}`, data),
  delete: (customProjectId) => api.delete(`/projects/${customProjectId}`),
  getStats: () => api.get('/projects/stats'),
};

// User API endpoints
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProjects: (userId, projectAssignments) => 
    api.put(`/users/${userId}/projects`, { projectAssignments }),
  suspend: (id, reason) => api.post(`/users/${id}/suspend`, { reason }),
  unsuspend: (id) => api.post(`/users/${id}/unsuspend`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health', { baseURL: 'http://localhost:5000' }),
};

// Helper functions
export const tokenHelper = {
  // Get tokens from localStorage
  getTokens: () => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),
  
  // Set tokens in localStorage
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  // Remove tokens from localStorage
  removeTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  // Get user from localStorage
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },
  
  // Set user in localStorage
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  // Check if user is Super Admin
  isSuperAdmin: () => {
    const user = tokenHelper.getUser();
    return user?.role === 'SUPER_ADMIN';
  },
  
  // Check if user is Project Admin
  isProjectAdmin: () => {
    const user = tokenHelper.getUser();
    return user?.role === 'ADMIN';
  },
  
  // Check if user is Sub User
  isSubUser: () => {
    const user = tokenHelper.getUser();
    return user?.role === 'SUB_USER';
  },
  
  // Get user's projects
  getUserProjects: () => {
    const user = tokenHelper.getUser();
    return user?.projects || [];
  },
};

// User Management API endpoints
export const userManagementAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  createProjectAdmin: (data) => api.post('/users/project-admin', data),
  createSubUser: (data) => api.post('/users/sub-user', data),
  updateProjects: (userId, data) => api.put(`/users/${userId}/projects`, data),
  suspend: (userId, data) => api.post(`/users/${userId}/suspend`, data),
  unsuspend: (userId, data) => api.post(`/users/${userId}/unsuspend`, data),
  getStats: () => api.get('/users/stats'),
};

// Project Access API endpoints
export const projectAccessAPI = {
  getAccess: (projectId) => api.get(`/project-access/${projectId}`),
  requestAccess: (projectId) => api.post(`/project-access/${projectId}/request`),
  grantAccess: (projectId, userId) => api.post(`/project-access/${projectId}/grant/${userId}`),
  revokeAccess: (projectId, userId) => api.post(`/project-access/${projectId}/revoke/${userId}`),
};

export default api; 