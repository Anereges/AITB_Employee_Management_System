<template>
  <div class="dashboard-layout">
    <AppSidebar :collapsed="sidebarCollapsed" @toggle-collapse="sidebarCollapsed = !sidebarCollapsed" />
    <div class="main-content" :class="{ 'collapsed': sidebarCollapsed }">
      <DashboardHeader @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed" />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import DashboardHeader from '@/pages/dashboard/DashboardHeader.vue'

const sidebarCollapsed = ref(false)
</script>

<style scoped>
.dashboard-layout {
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