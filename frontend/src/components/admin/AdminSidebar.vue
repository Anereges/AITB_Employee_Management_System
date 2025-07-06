<template>
  <aside class="admin-sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-shield-alt text-purple-500"></i>
        <span class="logo-text" v-if="!collapsed">Admin Portal</span>
      </div>
    </div>
    <nav class="sidebar-menu">
      <router-link
        v-for="item in menuItems"
        :key="item.text"
        :to="item.path"
        class="menu-item"
        active-class="active"
        exact-active-class="exact-active"
      >
        <i :class="item.icon"></i>
        <span class="menu-text" v-if="!collapsed">{{ item.text }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  collapsed: Boolean
})

// Use full paths matching your router config
const menuItems = [
  { path: '/dashboard/admin', icon: 'fas fa-tachometer-alt', text: 'Dashboard' },
  { path: '/dashboard/admin/system-settings', icon: 'fas fa-cogs', text: 'Settings' },
  { path: '/dashboard/admin/analytics', icon: 'fas fa-chart-bar', text: 'Analytics' },
  { path: '/dashboard/admin/leaverequests', icon: 'fas fa-calendar-check', text: 'Leave Requests' },
  { path: '/dashboard/admin/position', icon: 'fas fa-briefcase', text: 'Position' },
  { path: '/dashboard/admin/report', icon: 'fas fa-chart-line', text: 'Report' },
  { path: '/dashboard/admin/departments', icon: 'fas fa-building', text: 'Departments' },  // <-- Added Departments
  { path: '/dashboard/admin/about', icon: 'fas fa-info-circle', text: 'About' }
];

</script>

<style scoped>
.admin-sidebar {
  @apply fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 w-64 z-50 border-r border-purple-100;
}

.admin-sidebar.collapsed {
  @apply w-20;
}

.sidebar-header {
  @apply p-4 border-b border-purple-100 flex items-center h-16 bg-purple-50;
}

.logo {
  @apply flex items-center text-xl font-bold text-purple-800;
}

.logo i {
  @apply mr-3 text-2xl;
}

.sidebar-menu {
  @apply py-4 overflow-y-auto h-[calc(100%-64px)];
}

.menu-item {
  @apply flex items-center px-4 py-3 mx-2 my-1 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors relative;
}

.menu-item i {
  @apply mr-3 text-lg text-purple-500;
}

.menu-item.active {
  @apply bg-purple-50 text-purple-600 font-medium;
}

.menu-text {
  @apply transition-all duration-300 opacity-100;
}

.admin-sidebar.collapsed .menu-text {
  @apply opacity-0 w-0 mr-0;
}

.admin-sidebar.collapsed .logo-text {
  @apply hidden;
}

.admin-sidebar.collapsed .logo {
  @apply justify-center;
}

.admin-sidebar.collapsed .menu-item {
  @apply justify-center mx-1 px-0;
}

.admin-sidebar.collapsed .menu-item i {
  @apply mr-0;
}
</style>
