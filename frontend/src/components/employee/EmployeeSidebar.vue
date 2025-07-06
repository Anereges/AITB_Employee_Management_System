<template>
  <aside
    class="employee-sidebar fixed top-0 left-0 h-full shadow-lg border-r transition-all duration-300 z-50"
    :class="[collapsed ? 'w-20' : 'w-64', 'bg-gradient-to-b from-green-50 to-green-100 border-green-200']"
  >
    <div
      class="sidebar-header flex items-center h-16 px-6 border-b border-green-200"
      :class="collapsed ? 'justify-center' : ''"
    >
      <div
        class="logo flex items-center text-green-700 font-extrabold text-2xl tracking-wide select-none cursor-default"
      >
        <i class="fas fa-user-tie text-green-500 mr-3"></i>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
            My Portal
          </span>
        </transition>
      </div>
    </div>

    <nav class="sidebar-menu py-6 overflow-y-auto h-[calc(100%-64px)]">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="menu-item group flex items-center mx-4 my-2 rounded-lg px-4 py-3 text-green-700 hover:bg-green-100 hover:text-green-600 transition-colors shadow-sm"
        active-class="active"
      >
        <i
          :class="item.icon + ' text-green-500 text-lg group-hover:text-green-600 transition-colors'"
        ></i>
        <transition name="fade">
          <span
            v-if="!collapsed"
            class="menu-text ml-4 font-semibold tracking-wide select-none"
          >
            {{ item.text }}
          </span>
        </transition>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  collapsed: Boolean
})

const menuItems = [
  { name: 'EmployeeDashboard', icon: 'fas fa-home', text: 'Dashboard' },
  { name: 'Attendances', icon: 'fas fa-calendar-alt', text: 'My Attendances' },
  { name: 'MyLeaveRequests', icon: 'fas fa-calendar-minus', text: 'Leave Requests' },
  { name: 'Reports', icon: 'fas fa-file-invoice', text: 'Reports' },
  { name: 'MyAbout', icon: 'fas fa-folder', text: 'About' }
]
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

/* Fade transition for text */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Sidebar base */
.employee-sidebar {
  box-shadow: 0 6px 20px rgb(16 185 129 / 0.15);
  border-right-width: 1.5px;
  backdrop-filter: saturate(180%) blur(10px);
  scroll-behavior: smooth;
}

/* Sidebar header */
.sidebar-header {
  background: linear-gradient(to right, #d1fae5, #34d399);
}

/* Logo */
.logo i {
  transition: color 0.3s ease;
}

/* Menu items */
.menu-item {
  background: white;
  box-shadow: 0 1px 4px rgb(16 185 129 / 0.05);
  transition:
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    color 0.3s ease;
  user-select: none;
}

.menu-item:hover {
  background: #bbf7d0;
  box-shadow: 0 6px 20px rgb(16 185 129 / 0.2);
  color: #059669; /* green-600 */
}

.menu-item.active {
  background: #34d399; /* green-400 */
  color: white;
  font-weight: 700;
  box-shadow: 0 8px 30px rgb(16 185 129 / 0.4);
}

.menu-item.active i {
  color: white !important;
}

/* Collapsed sidebar adjustments */
.employee-sidebar.w-20 .menu-text,
.employee-sidebar.w-20 .logo-text {
  display: none;
}

.employee-sidebar.w-20 .menu-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.employee-sidebar.w-20 .menu-item i {
  margin-right: 0;
  font-size: 1.5rem;
}

/* Scrollbar styling */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}
.sidebar-menu::-webkit-scrollbar-thumb {
  background-color: #34d399; /* green-400 */
  border-radius: 3px;
}
.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}
</style>
