// App.vue
<template>
  <div class="min-h-screen bg-gray-100">
    <ToastNotification />
    

    <div v-if="!authReady" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>

    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <div :key="$route.fullPath" class="router-view-container">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const route = useRoute()
const authStore = useAuthStore()
const authReady = ref(false)

const showNavbar = computed(() => {
  return !['Login', 'Register'].includes(route.name) && authStore.isAuthenticated
})

const isAdminRoute = computed(() => {
  return route.matched.some(r => r.meta?.requiresAdminLayout)
})

onMounted(async () => {
  try {
    await authStore.initialize()
  } catch (error) {
    console.error('Auth initialization failed:', error)
  } finally {
    authReady.value = true
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.router-view-container {
  min-height: calc(100vh - 64px);
}
</style>