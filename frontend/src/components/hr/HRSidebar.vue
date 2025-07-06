<template>
    <aside class="hr-sidebar" :class="{ 'collapsed': collapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <i class="fas fa-users text-blue-500"></i>
          <span class="logo-text" v-if="!collapsed">HR Portal</span>
        </div>
      </div>
      <nav class="sidebar-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="menu-item"
          active-class="active"
        >
          <i :class="item.icon"></i>
          <span class="menu-text" v-if="!collapsed">{{ item.text }}</span>
          <span class="badge" v-if="item.badge && !collapsed">{{ item.badge }}</span>
        </router-link>
      </nav>
    </aside>
  </template>
  
  <script setup>
  defineProps({
    collapsed: Boolean
  })
  
  const menuItems = [
    { name: 'HRDashboard', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
    { name: 'EmployeeManagement', icon: 'fas fa-users', text: 'Employees' },
    { name: 'AttendanceTracking', icon: 'fas fa-calendar-check', text: 'Attendance', badge: 3 },
    { name: 'LeaveApprovals', icon: 'fas fa-calendar-minus', text: 'Leave Requests', badge: 5 },
    { name: 'PayrollProcessing', icon: 'fas fa-file-invoice-dollar', text: 'Payroll' },
    { name: 'Recruitment', icon: 'fas fa-user-plus', text: 'Recruitment' },
    { name: 'Training', icon: 'fas fa-chalkboard-teacher', text: 'Training' }
  ]
  </script>
  
  <style scoped>
  .hr-sidebar {
    @apply fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 w-64 z-50 border-r border-blue-100;
  }
  
  .hr-sidebar.collapsed {
    @apply w-20;
  }
  
  .sidebar-header {
    @apply p-4 border-b border-blue-100 flex items-center h-16 bg-blue-50;
  }
  
  .logo {
    @apply flex items-center text-xl font-bold text-blue-800;
  }
  
  .logo i {
    @apply mr-3 text-2xl;
  }
  
  .sidebar-menu {
    @apply py-4 overflow-y-auto h-[calc(100%-64px)];
  }
  
  .menu-item {
    @apply flex items-center px-4 py-3 mx-2 my-1 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors relative;
  }
  
  .menu-item i {
    @apply mr-3 text-lg text-blue-500;
  }
  
  .menu-item.active {
    @apply bg-blue-50 text-blue-600 font-medium;
  }
  
  .menu-text {
    @apply transition-all duration-300 opacity-100;
  }
  
  .badge {
    @apply absolute right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center;
  }
  
  .hr-sidebar.collapsed .menu-text,
  .hr-sidebar.collapsed .badge {
    @apply opacity-0 w-0 mr-0;
  }
  
  .hr-sidebar.collapsed .logo-text {
    @apply hidden;
  }
  
  .hr-sidebar.collapsed .logo {
    @apply justify-center;
  }
  
  .hr-sidebar.collapsed .menu-item {
    @apply justify-center mx-1 px-0;
  }
  
  .hr-sidebar.collapsed .menu-item i {
    @apply mr-0;
  }
  </style>