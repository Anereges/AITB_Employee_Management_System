import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import { useRouter } from 'vue-router';
import { useToast } from '@/composables/useToast';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const { showToast } = useToast();

  // State
  const token = ref(localStorage.getItem('authToken') || null);
  const user = ref(JSON.parse(localStorage.getItem('authUser')) || null);
  const isLoading = ref(false);
  const error = ref(null);
  const pendingApprovalsCount = ref(0);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role || null);
  const isActive = computed(() => user.value?.isActive || false);
  const isAdmin = computed(() => userRole.value === 'admin');
  const isHR = computed(() => userRole.value === 'hr');
  const isEmployee = computed(() => userRole.value === 'employee');

  // Set auth header for axios
  const setAuthHeader = () => {
    api.defaults.headers.common['Authorization'] = token.value ? `Bearer ${token.value}` : '';
  };

  // Clear auth data
  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    delete api.defaults.headers.common['Authorization'];
  };

  // Verify token with backend and update user data
  const verifyToken = async () => {
    if (!token.value) return false;

    try {
      const response = await api.get('/auth/verify');
      if (!response.data?.valid) {
        clearAuth();
        return false;
      }

      if (response.data.user) {
        user.value = response.data.user;
        localStorage.setItem('authUser', JSON.stringify(user.value));
      }

      return true;
    } catch (err) {
      console.error('Token verification failed:', err);
      clearAuth();
      return false;
    }
  };

  // Initialize auth state on store creation
  const initialize = async () => {
    if (token.value && user.value) {
      setAuthHeader();
      const isValid = await verifyToken();

      if (!isValid) {
        showToast('error', 'Session expired. Please login again.');
        return false;
      }

      if (isAdmin.value) {
        await fetchPendingApprovals();
      }

      return true;
    }
    return false;
  };

  // Axios request interceptor to add auth token header
  api.interceptors.request.use(config => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  // Fetch pending approvals count for admin users
  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get('/api/admin/pending-approvals/count');
      pendingApprovalsCount.value = response.data.count || 0;
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
        router.push('/login');
      }
      console.error('Failed to fetch pending approvals:', err);
      throw err;
    }
  };

  // Login method with CSRF token and admin approval check
  const login = async (credentials) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Get CSRF token first
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;

      // Login request with CSRF token
      const response = await api.post('/api/auth/login', credentials, {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Flexible token extraction to handle backend variations
      const authToken = response.data.data?.token 
                      || response.data.data?.accessToken 
                      || response.data.token;

      const userData = response.data.data?.employee || response.data.data?.user || null;

      if (!authToken || !userData) {
        throw new Error('Invalid login response: missing token or user data');
      }

      // Store token and user data
      token.value = authToken;
      user.value = userData;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      setAuthHeader();

      // Handle inactive account response
      if (response.data?.status === 'fail' && response.data?.isActive === false) {
        return {
          isActive: false,
          user: userData,
          message: response.data.message
        };
      }

      // Fetch pending approvals if admin
      if (userData.role?.toLowerCase() === 'admin') {
        await fetchPendingApprovals();
      }

      return userData;

    } catch (err) {
      // Handle inactive account error from backend
      if (err.response?.status === 403 && err.response.data?.isActive === false) {
        return {
          isActive: false,
          user: err.response.data?.data?.employee,
          message: err.response.data?.message
        };
      }

      // General error handling
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      error.value = errorMessage;
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  // Logout method
  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  // Admin approval methods
  const approveUser = async (userId) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/approve`);
      if (response.data.success) {
        showToast('success', 'User approved successfully');
        await fetchPendingApprovals();
      }
      return response.data;
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to approve user');
      throw err;
    }
  };

  const rejectUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}/reject`);
      if (response.data.success) {
        showToast('success', 'User rejected successfully');
        await fetchPendingApprovals();
      }
      return response.data;
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to reject user');
      throw err;
    }
  };

  // Initialize auth state on store creation
  initialize();

  return {
    // State
    token,
    user,
    isLoading,
    error,
    pendingApprovalsCount,

    // Getters
    isAuthenticated,
    userRole,
    isActive,
    isAdmin,
    isHR,
    isEmployee,

    // Actions
    login,
    logout,
    initialize,
    clearAuth,
    verifyToken,
    approveUser,
    rejectUser,
    fetchPendingApprovals
  };
});
