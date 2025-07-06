<template>
  <div class="settings-page">
    <h1 class="text-2xl font-bold mb-6">
      <i class="fas fa-cogs mr-2"></i>
      System Settings
    </h1>

    <div class="settings-grid">
      <div class="setting-card">
        <h2 class="setting-title">General Settings</h2>
        <form @submit.prevent="saveSettings">
          <div class="form-group">
            <label>System Name</label>
            <input v-model="settings.systemName" type="text">
          </div>
          <div class="form-group">
            <label>Timezone</label>
            <select v-model="settings.timezone">
              <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">
            Save Settings
          </button>
        </form>
      </div>

      <div class="setting-card">
        <h2 class="setting-title">Security</h2>
        <div class="security-settings">
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="settings.twoFactorEnabled">
              Enable Two-Factor Authentication
            </label>
          </div>
          <div class="form-group">
            <label>Password Policy</label>
            <select v-model="settings.passwordPolicy">
              <option value="low">Low (6+ characters)</option>
              <option value="medium">Medium (8+ with complexity)</option>
              <option value="high">High (12+ with complexity)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  systemName: 'Employee Portal',
  timezone: 'UTC',
  twoFactorEnabled: true,
  passwordPolicy: 'medium'
})

const timezones = ref([
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo'
])

const saveSettings = () => {
  console.log('Saving settings:', settings.value)
  // API call would go here
}
</script>

<style scoped>
.settings-page {
  @apply space-y-6;
}

.settings-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.setting-card {
  @apply bg-white p-6 rounded-lg shadow;
}

.setting-title {
  @apply text-xl font-semibold mb-4 pb-2 border-b;
}

.form-group {
  @apply mb-4;
}

.form-group label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-group input[type="text"],
.form-group select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500;
}

.checkbox-label {
  @apply inline-flex items-center;
}

.checkbox-label input {
  @apply h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2;
}
</style>