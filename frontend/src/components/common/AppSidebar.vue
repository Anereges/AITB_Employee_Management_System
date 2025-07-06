<template>
  <aside class="sidebar" :class="{ 'collapsed': collapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-chart-pie text-emerald-500"></i>
        <span class="logo-text" v-if="!collapsed">HR Dashboard</span>
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
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="status-indicator">
        <span class="status-dot bg-emerald-400"></span>
        <span>System Active</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  collapsed: Boolean
})

const menuItems = [
  { name: 'DashboardHome', icon: 'fas fa-home', text: 'Dashboard' },
  { name: 'Employees', icon: 'fas fa-users', text: 'Employees' },
  { name: 'Departments', icon: 'fas fa-building', text: 'Departments' },
  { name: 'Positions', icon: 'fas fa-briefcase', text: 'Positions' },
  { name: 'Analytic', icon: 'fas fa-chart-line', text: 'Analytics' },
  { name: 'Settings', icon: 'fas fa-cog', text: 'Settings' },
  { name: 'About', icon: 'fas fa-info-circle', text: 'About' }
]
</script>

<style scoped>
.sidebar {
  @apply fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 w-64 z-50;
}

.sidebar.collapsed {
  @apply w-20;
}

.sidebar-header {
  @apply p-4 border-b border-gray-100 flex items-center h-16;
}

.logo {
  @apply flex items-center text-xl font-bold text-gray-800;
}

.logo i {
  @apply mr-3 text-2xl;
}

.sidebar-menu {
  @apply py-4 overflow-y-auto h-[calc(100%-120px)];
}

.menu-item {
  @apply flex items-center px-4 py-3 mx-2 my-1 rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors relative;
}

.menu-item i {
  @apply mr-3 text-lg;
}

.menu-item.active {
  @apply bg-emerald-50 text-emerald-600 font-medium;
}

.badge {
  @apply absolute right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center;
}

.sidebar-footer {
  @apply absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100;
}

.status-indicator {
  @apply flex items-center text-xs text-gray-500;
}

.status-dot {
  @apply w-2 h-2 rounded-full mr-2 animate-pulse;
}

/* Collapsed state */
.sidebar.collapsed .logo-text,
.sidebar.collapsed .menu-text,
.sidebar.collapsed .badge {
  @apply hidden;
}

.sidebar.collapsed .logo {
  @apply justify-center;
}

.sidebar.collapsed .menu-item {
  @apply justify-center mx-1 px-0;
}

.sidebar.collapsed .menu-item i {
  @apply mr-0;
}
</style>