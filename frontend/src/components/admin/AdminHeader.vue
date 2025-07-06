<template>
  <header class="admin-header">
    <nav class="navbar">
      <!-- Logo and App Name -->
      <router-link to="/" class="brand-logo">
        <svg class="logo-icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span class="brand-name">{{ appName }}</span>
      </router-link>

      <!-- Navigation -->
      <ul class="nav-list">
        <li v-for="item in mainNavItems" :key="item.path" class="nav-item">
          <router-link
            :to="item.path"
            class="nav-link"
            :class="{ active: isActiveRoute(item.path) }"
          >
            <i :class="`icon-${item.icon}`" aria-hidden="true"></i>
            {{ item.name }}
            <span v-if="item.notificationCount" class="notification-badge">
              {{ item.notificationCount }}
            </span>
          </router-link>
        </li>
      </ul>

      <!-- Actions and User Menu -->
      <div class="user-controls">
        <!-- Quick Actions -->
        <button
          class="action-button quick-actions-toggle"
          @click="toggleQuickActions"
          aria-label="Toggle Quick Actions"
          :aria-expanded="quickActionsOpen"
        >
          <i class="icon-lightning"></i>
        </button>
        <div v-if="quickActionsOpen" class="quick-actions-menu" role="menu">
          <ul class="action-list">
            <li v-for="action in quickActions" :key="action.name" class="action-item">
              <button class="action-menu-item" @click="handleQuickAction(action)">
                <i :class="`icon-${action.icon}`"></i>
                {{ action.name }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Notifications -->
        <div class="notifications-wrapper">
          <button
            class="action-button notifications-toggle"
            @click="toggleNotifications"
            aria-label="Toggle Notifications"
            :aria-expanded="notificationsOpen"
          >
            <i class="icon-bell"></i>
            <span v-if="unreadNotifications > 0" class="notification-indicator"></span>
          </button>
          <transition name="fade">
            <div v-if="notificationsOpen" class="notifications-dropdown" role="menu">
              <header class="notifications-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" @click="markAllAsRead">Mark all as read</button>
              </header>
              <ul class="notifications-list">
                <li
                  v-for="note in notifications"
                  :key="note.id"
                  :class="['notification-item', { unread: !note.read }]"
                >
                  <div class="notification-content">
                    <p class="notification-title">{{ note.title }}</p>
                    <p class="notification-message">{{ note.message }}</p>
                    <time class="notification-time">{{ formatTime(note.timestamp) }}</time>
                  </div>
                  <button
                    class="notification-dismiss"
                    @click="dismissNotification(note.id)"
                    aria-label="Dismiss notification"
                  >
                    &times;
                  </button>
                </li>
                <li v-if="notifications.length === 0" class="empty-notifications">
                  No notifications
                </li>
              </ul>
            </div>
          </transition>
        </div>

        <!-- User Profile -->
        <button
          class="profile-button"
          @click="toggleProfileMenu"
          aria-label="Toggle Profile Menu"
          :aria-expanded="profileMenuOpen"
        >
          <template v-if="user.avatar">
            <img :src="user.avatar" alt="User Avatar" class="user-avatar" />
          </template>
          <template v-else>
            <div class="avatar-fallback">{{ getUserInitials(user.name) }}</div>
          </template>
          <span class="user-name">{{ user.name }}</span>
          <i :class="['dropdown-icon', { rotated: profileMenuOpen }]"></i>
        </button>
        <div v-if="profileMenuOpen" class="profile-menu" role="menu">
          <div class="profile-info">
            <div class="profile-avatar">
              <template v-if="user.avatar">
                <img :src="user.avatar" alt="User Avatar" class="menu-avatar" />
              </template>
              <template v-else>
                <div class="menu-avatar-fallback">{{ getUserInitials(user.name) }}</div>
              </template>
            </div>
            <div class="profile-details">
              <p class="profile-name">{{ user.name }}</p>
              <p class="profile-email">{{ user.email }}</p>
              <span class="profile-role">{{ user.role }}</span>
            </div>
          </div>
          <ul class="profile-actions">
            <li class="profile-action-item">
              <router-link to="/profile" class="profile-action-link">
                <i class="icon-user"></i> Profile
              </router-link>
            </li>
            <li class="profile-action-item">
              <button class="profile-action-link" @click="handleLogout">
                <i class="icon-log-out"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useUserStore } from '@/store/user'
import { useNotificationStore } from '@/store/notification' // Added notification store

export default {
  name: 'AdminHeader',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const userStore = useUserStore()
    const notificationStore = useNotificationStore() // Using notification store

    // App name
    const appName = 'Employee Portal'

    // Dropdown states
    const quickActionsOpen = ref(false)
    const notificationsOpen = ref(false)
    const profileMenuOpen = ref(false)

    // Use notifications from store instead of local state
    const notifications = computed(() => {
      try {
        return notificationStore.notifications || []
      } catch {
        return []
      }
    })

    const unreadNotifications = computed(() => {
      try {
        return notificationStore.unreadCount || 0
      } catch {
        return 0
      }
    })

    // User info from Pinia store
    const user = computed(() => userStore.user || {
      id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'Administrator',
      avatar: ''
    })

    const mainNavItems = ref([
 
  { name: 'Employees', path: '/dashboard/admin/employees', icon: 'users', notificationCount: computed(() => notificationStore.employeeNotifications) },
  { name: 'Attendance', path: '/dashboard/admin/attendance', icon: 'calendar' },
  { name: 'Payroll', path: '/dashboard/admin/payroll', icon: 'credit-card' },
  
  
])

const quickActions = ref([
  { name: 'Add Employee', icon: 'user-plus', action: () => router.push('/dashboard/admin/employees/new') },
  { name: 'Process Payroll', icon: 'dollar-sign', action: () => router.push('/dashboard/admin/payroll/process') },
  { name: 'Schedule Shift', icon: 'clock', action: () => router.push('/dashboard/admin/scheduling/new') },
  { name: 'Take Attendance', icon: 'check-circle', action: () => router.push('/dashboard/admin/attendance/new') },
  { name: 'Generate Report', icon: 'file-text', action: () => router.push('/dashboard/admin/reports/generate') }
])


    // Methods
    const isActiveRoute = (path) => route.path.startsWith(path)

    const toggleQuickActions = () => {
      quickActionsOpen.value = !quickActionsOpen.value
      if (quickActionsOpen.value) {
        notificationsOpen.value = false
        profileMenuOpen.value = false
      }
    }

    const toggleNotifications = () => {
      notificationsOpen.value = !notificationsOpen.value
      if (notificationsOpen.value) {
        quickActionsOpen.value = false
        profileMenuOpen.value = false
        markNotificationsAsViewed()
      }
    }

    const toggleProfileMenu = () => {
      profileMenuOpen.value = !profileMenuOpen.value
      if (profileMenuOpen.value) {
        quickActionsOpen.value = false
        notificationsOpen.value = false
      }
    }

    const handleQuickAction = (action) => {
      action.action()
      quickActionsOpen.value = false
    }

    const handleLogout = () => {
      userStore.logout()
      router.push('/login')
    }

    const markAllAsRead = () => {
      if (notificationStore.markAllAsRead) {
        notificationStore.markAllAsRead()
      }
    }

    const dismissNotification = (id) => {
      if (notificationStore.dismissNotification) {
        notificationStore.dismissNotification(id)
      }
    }

    const markNotificationsAsViewed = () => {
      if (notificationStore.markAllAsRead) {
        notificationStore.markAllAsRead()
      }
    }

    const formatTime = (date) => format(new Date(date), 'MMM d, h:mm a')

    const getUserInitials = (name) => {
      if (!name) return ''
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
    }

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      const target = event.target
      if (!target.closest('.quick-actions-toggle') && !target.closest('.quick-actions-menu')) {
        quickActionsOpen.value = false
      }
      if (!target.closest('.notifications-toggle') && !target.closest('.notifications-dropdown')) {
        notificationsOpen.value = false
      }
      if (!target.closest('.profile-button') && !target.closest('.profile-menu')) {
        profileMenuOpen.value = false
      }
    }

    // Fetch notifications on mount
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      notificationStore.fetchNotifications()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      appName,
      quickActionsOpen,
      notificationsOpen,
      profileMenuOpen,
      notifications,
      unreadNotifications,
      user,
      mainNavItems,
      quickActions,
      isActiveRoute,
      toggleQuickActions,
      toggleNotifications,
      toggleProfileMenu,
      handleQuickAction,
      handleLogout,
      markAllAsRead,
      dismissNotification,
      formatTime,
      getUserInitials
    }
  }
}
</script>

<style scoped>
.admin-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.brand-logo {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: #3b82f6;
  text-decoration: none;
  margin-right: 2rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  margin-right: 0.5rem;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.nav-item {
  margin-right: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  background-color: #eff6ff;
  color: #2563eb;
}

.notification-badge {
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
  padding: 0 6px;
  margin-left: 6px;
  min-width: 18px;
  text-align: center;
}

.user-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  font-size: 1.25rem;
  color: #64748b;
  transition: color 0.2s ease;
}

.action-button:hover {
  color: #2563eb;
}

.notification-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: #ef4444;
  border-radius: 9999px;
}

.notifications-wrapper {
  position: relative;
}

.quick-actions-menu,
.notifications-dropdown,
.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  width: 320px;
  margin-top: 0.5rem;
  z-index: 1100;
  max-height: 400px;
  overflow-y: auto;
}

.notifications-dropdown {
  right: -10px;
}

.action-list,
.notifications-list,
.profile-actions {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
}

.action-item,
.notification-item,
.profile-action-item {
  padding: 0 1rem;
}

.action-menu-item,
.profile-action-link {
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.75rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #1e293b;
  font-weight: 500;
  font-size: 0.95rem;
}

.action-menu-item:hover,
.profile-action-link:hover {
  background-color: #eff6ff;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-content {
  flex-grow: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
  white-space: normal;
  word-break: break-word;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.notification-dismiss {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.5rem;
}

.notification-dismiss:hover {
  color: #64748b;
}

.empty-notifications {
  padding: 1rem;
  text-align: center;
  color: #64748b;
  font-style: italic;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s ease;
}

.profile-button:hover {
  background-color: #eff6ff;
  color: #2563eb;
}

.user-avatar,
.menu-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  object-fit: cover;
}

.avatar-fallback,
.menu-avatar-fallback {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background-color: #cbd5e1;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-name {
  white-space: nowrap;
}

.profile-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.profile-details {
  flex-grow: 1;
}

.profile-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.profile-email {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.profile-role {
  background-color: #bfdbfe;
  color: #1e40af;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  display: inline-block;
}

.dropdown-icon {
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 4px;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(-135deg);
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.mark-all-read {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
}

.mark-all-read:hover {
  text-decoration: underline;
}
</style>