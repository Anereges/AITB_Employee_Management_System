<template>
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <h2 class="forgot-password-title">Forgot Password</h2>
        
        <form @submit.prevent="handleSubmit" class="forgot-password-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              type="email"
              id="email"
              v-model="email"
              required
              placeholder="Enter your email address"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
            />
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email }}
            </div>
          </div>
  
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">Send Reset Link</span>
            <span v-else class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </button>
  
          <div v-if="message" class="alert" :class="successful ? 'alert-success' : 'alert-danger'">
            {{ message }}
          </div>
        </form>
  
        <div class="back-to-login">
          <router-link to="/login" class="back-link">
            <i class="fas fa-arrow-left"></i> Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ForgotPassword',
    data() {
      return {
        email: '',
        errors: {
          email: ''
        },
        message: '',
        successful: false,
        isLoading: false
      }
    },
    methods: {
      handleSubmit() {
        this.isLoading = true;
        this.message = '';
        this.successful = false;
        
        // Reset validation errors
        this.errors.email = '';
        
        // Simple validation
        if (!this.email) {
          this.errors.email = 'Email is required';
          this.isLoading = false;
          return;
        }
        
        // Email format validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(this.email)) {
          this.errors.email = 'Please enter a valid email address';
          this.isLoading = false;
          return;
        }
        
        // Here you would typically call your API
        // For demonstration, we'll simulate an API call
        setTimeout(() => {
          // Simulate successful response
          this.successful = true;
          this.message = 'Password reset link has been sent to your email.';
          this.isLoading = false;
          
          // In a real app, you would handle errors here
        }, 1500);
      }
    }
  }
  </script>
  
  <style scoped>
  .forgot-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .forgot-password-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }
  
  .forgot-password-title {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-control {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-control.is-invalid {
    border-color: #dc3545;
  }
  
  .invalid-feedback {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background-color: #4a6cf7;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .submit-btn:hover {
    background-color: #3a5ce9;
  }
  
  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .alert {
    margin-top: 1rem;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }
  
  .alert-success {
    background-color: #d4edda;
    color: #155724;
  }
  
  .alert-danger {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .back-to-login {
    text-align: center;
    margin-top: 1.5rem;
  }
  
  .back-link {
    color: #4a6cf7;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
  
  .fa-arrow-left {
    margin-right: 5px;
  }
  </style>