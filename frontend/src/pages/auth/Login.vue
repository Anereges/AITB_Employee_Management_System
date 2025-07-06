<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
    <div 
      class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all duration-500 hover:shadow-2xl"
      :class="{'animate-pulse': loading}"
    >
      <div class="text-center mb-8">
        <div class="animate-bounce inline-block mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-green-700 mb-2">Welcome Back</h1>
        <p class="text-green-600">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              v-model="form.email"
              type="email"
              id="email"
              required
              class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              :class="{ 'border-red-500': errors.email }"
            >
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              required
              class="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              :class="{ 'border-red-500': errors.password }"
            >
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              @click="showPassword = !showPassword"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" v-if="showPassword" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" v-else d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          <div class="flex justify-end mt-1">
            <router-link 
              to="/forgot-password" 
              class="text-sm text-green-600 hover:text-green-800 hover:underline transition-colors"
            >
              Forgot password?
            </router-link>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
          :disabled="loading"
        >
          <span v-if="!loading">Login</span>
          <span v-else class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        </button>
      </form>

      <div class="mt-8">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            @click="socialLogin('google')"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.667-4.146-2.675-6.735-2.675-5.522 0-10 4.477-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.167-0.009-0.333-0.025-0.5h-9.975z"/>
            </svg>
          </button>
          <button
            @click="socialLogin('github')"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <p class="mt-8 text-center text-sm text-gray-600">
        Don't have an account?
        <router-link 
          to="/register" 
          class="font-medium text-green-600 hover:text-green-800 hover:underline transition-colors"
        >
          Create one
        </router-link>
      </p>
    </div>

    <!-- Inactive Account Modal -->
    <div v-if="showInactiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-8 max-w-sm w-full text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="mt-3 text-lg font-medium text-gray-900">Account Pending Approval</h3>
        <div class="mt-2 text-sm text-gray-500">
          <p>Your account is not yet active.</p>
          <p>Please wait for administrator approval.</p>
          <p>You'll receive an email when your account is activated.</p>
        </div>
        <div class="mt-5">
          <button
            @click="showInactiveModal = false"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/composables/useToast';
import { throttle } from 'lodash-es';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { showToast } = useToast();

// Form state
const form = ref({
  email: '',
  password: ''
});

// UI state
const showPassword = ref(false);
const loading = ref(false);
const showInactiveModal = ref(false);
const loginAttempts = ref(0);
const errors = ref({
  email: '',
  password: '',
  form: ''
});

// Auto-focus email field on mount
onMounted(() => {
  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.focus();
  
  // Check for redirect query parameter
  if (route.query.redirect) {
    showToast('info', 'Please login to access that page');
  }
});

// Enhanced form validation
const validateForm = () => {
  let isValid = true;
  errors.value = {};

  // Email validation
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Password validation
  if (!form.value.password) {
    errors.value.password = 'Password is required';
    isValid = false;
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return isValid;
};

// Throttled login to prevent rapid submissions
const throttledLogin = throttle(async () => {
  loading.value = true;
  errors.value.form = '';

  try {
    const response = await authStore.login(form.value);
    
    // Check if account is active
    if (response?.user && !response.user.isActive) {
      showInactiveModal.value = true;
      return;
    }

    // Successful login handling
    handleSuccessfulLogin();
    
  } catch (error) {
    handleLoginError(error);
  } finally {
    loading.value = false;
  }
}, 1000); // Throttle to 1 request per second

// Handle successful login
const handleSuccessfulLogin = () => {
  loginAttempts.value = 0; // Reset attempts on success
  
  // Show success message
  showToast('success', 'Login successful!', {
    timeout: 2000,
    showProgress: true
  });

  // Redirect based on role and original path
  const redirectPath = route.query.redirect 
    ? route.query.redirect 
    : getRoleBasedRedirectPath(authStore.user.role);
  
  router.push(redirectPath);
};

// Handle login errors
const handleLoginError = (error) => {
  loginAttempts.value += 1;
  
  if (loginAttempts.value >= 3) {
    errors.value.form = 'Too many failed attempts. Please wait a moment.';
    return;
  }

  if (error.response) {
    switch (error.response.status) {
      case 401:
        errors.value.form = 'Invalid email or password';
        break;
      case 403:
        showInactiveModal.value = true;
        break;
      case 429:
        errors.value.form = 'Too many requests. Please slow down.';
        break;
      case 500:
        errors.value.form = 'Server error. Please try again later.';
        break;
      default:
        errors.value.form = error.response.data?.message || 'Login failed';
    }
  } else if (error.request) {
    errors.value.form = 'Network error. Please check your connection.';
  } else {
    errors.value.form = error.message || 'An unexpected error occurred';
  }
  
  // Clear password field on error
  form.value.password = '';
  const passwordInput = document.getElementById('password');
  if (passwordInput) passwordInput.focus();
};

// Handle login submission
const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  if (loginAttempts.value >= 3) {
    errors.value.form = 'Please wait before trying again';
    return;
  }

  loading.value = true;
  errors.value.form = '';

  try {
    const result = await authStore.login(form.value);
    
    if (result?.isActive === false) {
      // Handle inactive account
      showInactiveModal.value = true;
      return;
    }

    // Successful login
    showToast('success', 'Login successful!');
    
    const redirectPath = route.query.redirect || 
                       getRoleBasedRedirectPath(authStore.user.role);
    router.push(redirectPath);

  } catch (error) {
    if (error.response?.status === 403) {
      if (error.response.data?.message?.includes('CSRF')) {
        errors.value.form = 'Session expired. Please refresh the page.';
      } else {
        errors.value.form = error.response.data?.message || 'Access denied';
      }
    } else {
      errors.value.form = error.message || 'Login failed';
    }
  } finally {
    loading.value = false;
  }
};

// Role-based redirection
const getRoleBasedRedirectPath = (role) => {
  const rolePaths = {
    admin: '/dashboard/admin',
    hr: '/dashboard/hr',
    employee: '/dashboard/employee'
  };
  
  return rolePaths[role.toLowerCase()] || '/';
};

// Social login handler with enhanced security
const socialLogin = async (provider) => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    errors.value.form = '';
    
    // Generate a random state token for CSRF protection
    const stateToken = window.crypto.randomUUID();
    sessionStorage.setItem('oauth_state', stateToken);
    
    await authStore.socialLogin(provider, stateToken);
    
    // Check account status
    if (!authStore.user.isActive) {
      showInactiveModal.value = true;
      return;
    }

    handleSuccessfulLogin();
  } catch (error) {
    handleLoginError(error);
  } finally {
    loading.value = false;
  }
};

// Handle password visibility toggle
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
  const passwordInput = document.getElementById('password');
  if (passwordInput) passwordInput.focus();
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>