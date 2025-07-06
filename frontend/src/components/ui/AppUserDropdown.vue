<script setup>
import { ref } from 'vue'
const props = defineProps({
  name: String,
  role: String,
  avatar: String
});

const userMenuOpen = ref(false);

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value;
};

const menuItems = [
  { icon: 'fas fa-user', text: 'Profile', link: '/profile' },
  { icon: 'fas fa-cog', text: 'Settings', link: '/settings' },
  { icon: 'fas fa-sign-out-alt', text: 'Logout', link: '/logout' }
];
</script>

<template>
  <div class="relative">
    <button 
      @click="toggleUserMenu"
      class="user-profile-btn"
    >
      <img 
        :src="avatar" 
        :alt="name"
        class="user-avatar"
      />
      <span class="user-info">
        <span class="user-name">{{ name }}</span>
        <span class="user-role">{{ role }}</span>
      </span>
      <i class="fas fa-chevron-down user-dropdown-icon"></i>
    </button>

    <div 
      v-if="userMenuOpen"
      class="user-dropdown"
    >
      <div class="user-dropdown-header">
        <img 
          :src="avatar" 
          :alt="name"
          class="dropdown-avatar"
        />
        <div>
          <div class="dropdown-name">{{ name }}</div>
          <div class="dropdown-role">{{ role }}</div>
        </div>
      </div>
      <div class="user-dropdown-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.text"
          :to="item.link"
          class="menu-item"
          @click="userMenuOpen = false"
        >
          <i :class="item.icon"></i>
          <span>{{ item.text }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-btn {
  @apply flex items-center space-x-2;
  @apply p-1 pr-2 rounded-full;
  @apply hover:bg-gray-100 transition-colors;
  @apply dark:hover:bg-gray-700;
  @apply focus:outline-none;
}

.user-avatar {
  @apply w-8 h-8 rounded-full;
  @apply border-2 border-white dark:border-gray-800;
}

.user-info {
  @apply hidden sm:block text-left;
}

.user-name {
  @apply block text-sm font-medium text-gray-800 dark:text-white;
}

.user-role {
  @apply block text-xs text-gray-500 dark:text-gray-400;
}

.user-dropdown-icon {
  @apply hidden sm:block text-gray-400 text-xs ml-1;
}

.user-dropdown {
  @apply absolute right-0 mt-2 w-56;
  @apply bg-white rounded-lg shadow-xl;
  @apply dark:bg-gray-800 dark:border dark:border-gray-700;
  @apply z-50;
}

.user-dropdown-header {
  @apply flex items-center p-4 border-b;
  @apply dark:border-gray-700;
}

.dropdown-avatar {
  @apply w-10 h-10 rounded-full mr-3;
}

.dropdown-name {
  @apply text-sm font-medium text-gray-800 dark:text-white;
}

.dropdown-role {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.user-dropdown-menu {
  @apply py-1;
}

.menu-item {
  @apply flex items-center px-4 py-2 text-sm;
  @apply text-gray-700 hover:bg-gray-100;
  @apply dark:text-gray-300 dark:hover:bg-gray-700;
  @apply transition-colors;
}

.menu-item i {
  @apply mr-3 text-gray-400;
}

.menu-item.router-link-active {
  @apply bg-gray-100 dark:bg-gray-700;
}
</style>