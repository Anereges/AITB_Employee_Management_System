<template>
    <div class="quick-actions">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <button v-for="action in actions" :key="action.text" class="action-btn">
          <div class="action-icon" :class="action.bgColor">
            <i :class="action.icon"></i>
          </div>
          <span class="action-text">{{ action.text }}</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  const actions = [
    {
      text: 'Add Employee',
      icon: 'fas fa-user-plus',
      bgColor: 'bg-emerald-100'
    },
    {
      text: 'Process Payroll',
      icon: 'fas fa-file-invoice-dollar',
      bgColor: 'bg-blue-100'
    },
    {
      text: 'Schedule Training',
      icon: 'fas fa-chalkboard-teacher',
      bgColor: 'bg-purple-100'
    },
    {
      text: 'Generate Report',
      icon: 'fas fa-file-alt',
      bgColor: 'bg-amber-100'
    }
  ]
  </script>
  
  <style scoped>
  .quick-actions {
    @apply bg-white rounded-xl shadow-sm p-6;
  }
  
  .section-title {
    @apply text-lg font-semibold text-gray-800 mb-6;
  }
  
  .actions-grid {
    @apply grid grid-cols-2 md:grid-cols-4 gap-4;
  }
  
  .action-btn {
    @apply flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors;
  }
  
  .action-icon {
    @apply rounded-full p-3 mb-2 text-white;
  }
  
  .action-icon i {
    @apply text-lg;
  }
  
  .action-text {
    @apply text-sm font-medium text-gray-700;
  }
  </style>