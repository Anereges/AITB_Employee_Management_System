<script setup>
import { ref } from 'vue';
import AppSearch from '@/components/ui/AppSearch.vue';
import AppNotifications from '@/components/ui/AppNotifications.vue';
import AppUserDropdown from '@/components/ui/AppUserDropdown.vue';

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<template>
  <header class="app-header">
    <!-- Left Section - Logo and Mobile Menu Toggle -->
    <div class="header-left">
      <button class="mobile-menu-btn lg:hidden" @click="toggleMobileMenu">
        <i class="fas fa-bars"></i>
      </button>
      <router-link to="/" class="logo">
        <i class="fas fa-chart-line text-primary"></i>
        <span class="logo-text">AITB</span>
      </router-link>
    </div>

    <!-- Center Section - Search (visible on larger screens) -->
    <div class="header-center hidden lg:block">
      <AppSearch />
    </div>

    <!-- Right Section - Actions -->
    <div class="header-right">
      <div class="header-actions">
        <!-- Search Button (mobile only) -->
        <button class="search-btn lg:hidden">
          <i class="fas fa-search"></i>
        </button>

        <!-- Theme Toggle -->
        <button class="theme-toggle">
          <i class="fas fa-moon dark-mode-icon"></i>
          <i class="fas fa-sun light-mode-icon"></i>
        </button>

        <!-- Notifications -->
        <AppNotifications :count="3" />

        <!-- User Dropdown -->
        <AppUserDropdown 
          name="Jane Doe"
          role="Admin"
          avatar="https://randomuser.me/api/portraits/women/44.jpg"
        />
      </div>
    </div>

    <!-- Mobile Search (shown when toggled) -->
    <div v-if="mobileMenuOpen" class="mobile-search lg:hidden">
      <AppSearch />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  @apply bg-white shadow-sm sticky top-0 z-50;
  @apply flex flex-wrap items-center justify-between;
  @apply px-4 py-3 lg:px-6;
}

.header-left {
  @apply flex items-center space-x-4;
}

.mobile-menu-btn {
  @apply text-gray-600 hover:text-gray-900;
  @apply text-xl focus:outline-none;
}

.logo {
  @apply flex items-center space-x-2;
  @apply text-xl font-bold;
  @apply hover:text-primary transition-colors;
}

.logo-text {
  @apply hidden sm:inline;
}

.header-center {
  @apply flex-1 max-w-2xl mx-4;
}

.header-right {
  @apply flex items-center;
}

.header-actions {
  @apply flex items-center space-x-3 sm:space-x-4;
}

.search-btn,
.theme-toggle {
  @apply text-gray-600 hover:text-gray-900;
  @apply text-lg p-2 rounded-full;
  @apply hover:bg-gray-100 transition-colors;
  @apply focus:outline-none;
}

.theme-toggle {
  @apply relative overflow-hidden;
  @apply w-10 h-10 flex items-center justify-center;
}

.dark-mode-icon,
.light-mode-icon {
  @apply absolute transition-opacity duration-300;
}

.dark-mode-icon {
  @apply opacity-100;
}

.light-mode-icon {
  @apply opacity-0;
}

.dark .dark-mode-icon {
  @apply opacity-0;
}

.dark .light-mode-icon {
  @apply opacity-100;
}

.mobile-search {
  @apply w-full mt-3;
  @apply lg:hidden;
}

/* Dark mode styles */
.dark .app-header {
  @apply bg-gray-800 text-white;
}

.dark .mobile-menu-btn,
.dark .search-btn,
.dark .theme-toggle {
  @apply text-gray-300 hover:text-white;
}

.dark .search-btn:hover,
.dark .theme-toggle:hover {
  @apply bg-gray-700;
}
</style>