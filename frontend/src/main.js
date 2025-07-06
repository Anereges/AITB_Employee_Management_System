import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'

// Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth and setup guard AFTER router installation
import { useAuthStore } from '@/store/auth'
const authStore = useAuthStore(pinia)

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} | Employee Management`
  }

  // Skip auth check for public routes
  if (to.meta.public) return next()

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Try to initialize auth from localStorage
    await authStore.initialize()
    
    if (!authStore.isAuthenticated) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  }

  // Check if account is active
  if (!authStore.user?.isActive) {
    return next({
      path: '/login',
      query: { 
        redirect: to.fullPath,
        message: 'Your account is pending admin approval'
      }
    })
  }

  // Check user role against route requirements
  if (to.meta.roles && !to.meta.roles.includes(authStore.userRole)) {
    switch(authStore.userRole) {
      case 'admin': return next('/admin')
      case 'hr': return next('/dashboard')
      case 'employee': return next('/employee')
      default: return next('/unauthorized')
    }
  }

  next()
})

// Initialize auth store
authStore.initialize()

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 60,
  hideProgressBar: false,
  newestOnTop: true,
  transition: 'Vue-Toastification__fade'
}
app.use(Toast, toastOptions)

app.mount('#app')