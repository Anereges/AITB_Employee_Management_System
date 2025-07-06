import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// CSRF Token Handling
let csrfToken = null;

// Fetch CSRF token before making requests
const getCsrfToken = async () => {
  try {
    const res = await api.get('/api/csrf-token'); 
    csrfToken = res.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error); // ✅ this is fine now
  }
};


// Request interceptor
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    if (!csrfToken) {
      await getCsrfToken();
    }
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.message === 'Invalid CSRF token'
    ) {
      await getCsrfToken();
      originalRequest.headers['X-CSRF-Token'] = csrfToken;
      return api(originalRequest);
    }

     // Handle expired/invalid tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
