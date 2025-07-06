<template>
    <div class="settings-page">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
      </div>
      
      <div class="settings-container">
        <div class="settings-sidebar">
          <button 
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="{ 'active': activeTab === tab.id }"
            class="settings-tab"
          >
            <i :class="tab.icon" class="mr-2"></i>
            {{ tab.label }}
          </button>
        </div>
        
        <div class="settings-content">
          <!-- General Settings -->
          <div v-if="activeTab === 'general'" class="tab-content">
            <h2 class="tab-title">General Settings</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>Company Name</label>
                <input type="text" v-model="company.name" placeholder="Enter company name">
              </div>
              <div class="form-group">
                <label>Timezone</label>
                <select v-model="company.timezone">
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Date Format</label>
                <select v-model="company.dateFormat">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div class="form-group">
                <label>Company Logo</label>
                <div class="logo-upload">
                  <img v-if="company.logo" :src="company.logo" alt="Company Logo" class="logo-preview">
                  <div v-else class="logo-placeholder">
                    <i class="fas fa-building"></i>
                  </div>
                  <button class="upload-btn">
                    <i class="fas fa-upload mr-2"></i>
                    Upload Logo
                  </button>
                </div>
              </div>
              <div class="form-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save Changes</button>
              </div>
            </div>
          </div>
          
          <!-- Email Settings -->
          <div v-if="activeTab === 'email'" class="tab-content">
            <h2 class="tab-title">Email Settings</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>SMTP Host</label>
                <input type="text" v-model="email.smtpHost" placeholder="smtp.example.com">
              </div>
              <div class="form-group">
                <label>SMTP Port</label>
                <input type="number" v-model="email.smtpPort" placeholder="587">
              </div>
              <div class="form-group">
                <label>SMTP Username</label>
                <input type="text" v-model="email.smtpUser" placeholder="username">
              </div>
              <div class="form-group">
                <label>SMTP Password</label>
                <input type="password" v-model="email.smtpPass" placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>From Email</label>
                <input type="email" v-model="email.fromEmail" placeholder="noreply@example.com">
              </div>
              <div class="form-group">
                <label>From Name</label>
                <input type="text" v-model="email.fromName" placeholder="Company Name">
              </div>
              <div class="form-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save Changes</button>
              </div>
            </div>
          </div>
          
          <!-- Leave Settings -->
          <div v-if="activeTab === 'leave'" class="tab-content">
            <h2 class="tab-title">Leave Settings</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>Annual Leave Days</label>
                <input type="number" v-model="leave.annualLeave" placeholder="21">
              </div>
              <div class="form-group">
                <label>Sick Leave Days</label>
                <input type="number" v-model="leave.sickLeave" placeholder="10">
              </div>
              <div class="form-group">
                <label>Carry Over Policy</label>
                <select v-model="leave.carryOver">
                  <option value="none">No Carry Over</option>
                  <option value="limited">Limited Carry Over (5 days)</option>
                  <option value="full">Full Carry Over</option>
                </select>
              </div>
              <div class="form-group">
                <label>Leave Approval Workflow</label>
                <select v-model="leave.approvalWorkflow">
                  <option value="direct">Direct Manager</option>
                  <option value="hr">HR Department</option>
                  <option value="both">Both Manager and HR</option>
                </select>
              </div>
              <div class="form-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save Changes</button>
              </div>
            </div>
          </div>
          
          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="tab-content">
            <h2 class="tab-title">Security Settings</h2>
            <div class="settings-form">
              <div class="form-group">
                <label>Password Policy</label>
                <select v-model="security.passwordPolicy">
                  <option value="basic">Basic (6 characters minimum)</option>
                  <option value="medium">Medium (8 characters, 1 number)</option>
                  <option value="strong">Strong (10 characters, mixed case, special chars)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Two-Factor Authentication</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="twoFactor" v-model="security.twoFactorEnabled">
                  <label for="twoFactor"></label>
                  <span>{{ security.twoFactorEnabled ? 'Enabled' : 'Disabled' }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Session Timeout</label>
                <select v-model="security.sessionTimeout">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="0">Until browser closes</option>
                </select>
              </div>
              <div class="form-group">
                <label>Login Attempts Before Lockout</label>
                <input type="number" v-model="security.loginAttempts" min="1" max="10">
              </div>
              <div class="form-actions">
                <button class="cancel-btn">Cancel</button>
                <button class="save-btn">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const tabs = ref([
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'email', label: 'Email', icon: 'fas fa-envelope' },
    { id: 'leave', label: 'Leave', icon: 'fas fa-calendar-alt' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' }
  ])
  
  const activeTab = ref('general')
  
  const company = ref({
    name: 'Tech Solutions Inc.',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    logo: ''
  })
  
  const email = ref({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    fromEmail: '',
    fromName: ''
  })
  
  const leave = ref({
    annualLeave: 21,
    sickLeave: 10,
    carryOver: 'limited',
    approvalWorkflow: 'direct'
  })
  
  const security = ref({
    passwordPolicy: 'medium',
    twoFactorEnabled: false,
    sessionTimeout: '60',
    loginAttempts: 5
  })
  </script>
  
  <style scoped>
  .settings-page {
    @apply bg-white rounded-xl shadow-sm p-6;
  }
  
  .page-header {
    @apply mb-6;
  }
  
  .page-title {
    @apply text-2xl font-bold text-gray-800;
  }
  
  .settings-container {
    @apply flex flex-col md:flex-row;
  }
  
  .settings-sidebar {
    @apply w-full md:w-56 flex md:flex-col space-x-2 md:space-x-0 md:space-y-2 mb-6 md:mb-0 md:mr-6 overflow-x-auto;
  }
  
  .settings-tab {
    @apply flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 whitespace-nowrap;
  }
  
  .settings-tab.active {
    @apply bg-emerald-50 text-emerald-600 font-medium;
  }
  
  .settings-tab i {
    @apply text-lg;
  }
  
  .settings-content {
    @apply flex-1;
  }
  
  .tab-content {
    @apply p-4 md:p-6 border border-gray-200 rounded-lg;
  }
  
  .tab-title {
    @apply text-xl font-semibold text-gray-800 mb-6;
  }
  
  .settings-form {
    @apply space-y-6;
  }
  
  .form-group {
    @apply mb-4;
  }
  
  .form-group label {
    @apply block text-sm font-medium text-gray-700 mb-2;
  }
  
  .form-group input,
  .form-group select {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300;
  }
  
  .logo-upload {
    @apply flex items-center space-x-4;
  }
  
  .logo-preview {
    @apply w-16 h-16 rounded-lg object-cover border border-gray-200;
  }
  
  .logo-placeholder {
    @apply w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-2xl;
  }
  
  .upload-btn {
    @apply flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50;
  }
  
  .form-actions {
    @apply flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-100;
  }
  
  .cancel-btn {
    @apply px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50;
  }
  
  .save-btn {
    @apply px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700;
  }
  
  .toggle-switch {
    @apply flex items-center;
  }
  
  .toggle-switch input[type="checkbox"] {
    @apply h-0 w-0 invisible;
  }
  
  .toggle-switch label {
    @apply cursor-pointer w-12 h-6 bg-gray-300 rounded-full relative mr-2;
  }
  
  .toggle-switch label:after {
    @apply content-[''] absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition;
  }
  
  .toggle-switch input:checked + label {
    @apply bg-emerald-500;
  }
  
  .toggle-switch input:checked + label:after {
    @apply left-auto right-1;
  }
  </style>