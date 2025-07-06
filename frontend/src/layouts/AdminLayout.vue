<template>
  <div class="admin-layout">
    <AdminSidebar :collapsed="sidebarCollapsed" />
    <div class="main-content" :class="{ 'collapsed': sidebarCollapsed }">
      <AdminHeader @toggle-sidebar="toggleSidebar" />
      
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.path" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'

const sidebarCollapsed = ref(false)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<style scoped>
.admin-layout {
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>