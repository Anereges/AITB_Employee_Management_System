import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import router from '@/router'; // Make sure to import your router instance

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (keep existing)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Enhanced response interceptor
api.interceptors.response.use(
  response => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Attempt token refresh if available
        if (authStore.token) {
          try {
            await authStore.verifyToken();
            const newToken = localStorage.getItem('auth_token');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Continue to clear auth and redirect
          }
        }
      }

      // Clear auth state and redirect to login
      authStore.clearAuth();
      
      if (router.currentRoute.value.name !== 'Login') {
        await router.replace({
          name: 'Login',
          query: {
            redirect: router.currentRoute.value.fullPath,
            reason: 'session_expired'
          }
        });
      }
    }

    // Handle 403 Forbidden responses
    if (error.response?.status === 403) {
      console.error('Forbidden access - insufficient permissions');
      if (router.currentRoute.value.name !== 'Dashboard') {
        await router.replace({
          name: 'Dashboard',
          query: {
            error: 'insufficient_permissions'
          }
        });
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;