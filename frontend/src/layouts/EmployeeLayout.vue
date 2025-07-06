<template>
    <div class="employee-layout">
      <EmployeeSidebar :collapsed="sidebarCollapsed" />
      <div class="main-content" :class="{ 'collapsed': sidebarCollapsed }">
        <EmployeeHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />
        <main class="content-wrapper">
          <router-view />
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import EmployeeSidebar from '@/components/employee/EmployeeSidebar.vue'
  import EmployeeHeader from '@/components/employee/EmployeeHeader.vue'
  
  const sidebarCollapsed = ref(false)
  </script>
  
  <style scoped>
  .employee-layout {
    @apply flex min-h-screen bg-gray-50;
  }
  
  .main-content {
    @apply flex-1 transition-all duration-300 ml-64;
  }
  
  .main-content.collapsed {
    @apply ml-20;
  }
  
  .content-wrapper {
    @apply p-6;
  }
  </style>