<template>
  <header class="employee-header">
    <div class="header-container">
      <!-- Logo and Company Name -->
      <div class="brand-section">
        <router-link to="/dashboard/employee" class="brand-link animate__animated animate__fadeIn">
          <img :src="companyLogo" alt="Company Logo" class="logo" v-if="companyLogo" />
          <span class="company-name">{{ companyName }}</span>
        </router-link>
      </div>

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.path" class="nav-item">
            <router-link
              :to="item.path"
              class="nav-link"
              :class="{ active: $route.path.startsWith(item.path) }"
            >
              <i :class="item.icon" class="nav-icon"></i>
              <span class="nav-text">{{ item.text }}</span>
              <span class="nav-highlight"></span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- User Profile Section -->
      <div class="profile-section">
        <!-- Notifications -->
        <div class="notifications">
          <button
            class="notification-btn"
            @click="toggleNotifications"
            aria-haspopup="true"
            :aria-expanded="showNotifications.toString()"
            aria-label="Toggle notifications"
          >
            <div class="notification-icon-wrapper">
              <i class="fas fa-bell"></i>
              <span class="badge pulse" v-if="unreadNotifications > 0">{{ unreadNotifications }}</span>
            </div>
          </button>
          <transition name="slide-fade">
            <div v-if="showNotifications" class="notifications-dropdown" role="dialog" aria-modal="true">
              <div class="notification-header">
                <h4>Notifications</h4>
                <button class="mark-all-read" @click="markAllAsRead">Mark all as read</button>
              </div>
              <div class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.read }"
                >
                  <div class="notification-icon">
                    <i :class="notification.icon"></i>
                  </div>
                  <div class="notification-content">
                    <p>{{ notification.message }}</p>
                    <small class="notification-time">{{ notification.time }}</small>
                  </div>
                </div>
                <div v-if="notifications.length === 0" class="empty-notifications">
                  <i class="fas fa-bell-slash"></i>
                  <p>No new notifications</p>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Profile Dropdown -->
        <div class="profile-dropdown">
          <button
            class="profile-btn"
            @click="toggleProfileDropdown"
            aria-haspopup="true"
            :aria-expanded="showProfileDropdown.toString()"
            aria-label="Toggle profile menu"
          >
            <div class="avatar-wrapper">
              <img :src="user.avatar" alt="User Avatar" class="avatar" v-if="user.avatar" />
              <div class="avatar-placeholder" v-else>
                {{ userInitials }}
              </div>
            </div>
            <span class="user-name">{{ user.name }}</span>
            <i class="fas fa-chevron-down dropdown-icon"></i>
          </button>
          <transition name="slide-fade">
            <div v-if="showProfileDropdown" class="dropdown-menu" role="menu">
              <div class="dropdown-header">
                <div class="dropdown-avatar">
                  <img :src="user.avatar" alt="User Avatar" v-if="user.avatar" />
                  <div class="avatar-placeholder" v-else>
                    {{ userInitials }}
                  </div>
                </div>
                <div class="dropdown-user-info">
                  <h5>{{ user.name }}</h5>
                  <span class="user-role">{{ user.role }}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/dashboard/employee/profile" class="dropdown-item" role="menuitem">
                <i class="fas fa-user"></i> My Profile
              </router-link>
              <router-link to="/dashboard/employee/settings" class="dropdown-item" role="menuitem">
                <i class="fas fa-cog"></i> Settings
              </router-link>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-btn" @click="logout" role="menuitem">
                <i class="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import companyLogo from '@/assets/am.jpg'
import userAvatar from '@/assets/am.jpg'

export default {
  name: 'EmployeeHeader',
  data() {
    return {
      companyName: 'AITB',
      companyLogo,
      showNotifications: false,
      showProfileDropdown: false,
      user: {
        name: 'Amanuel Sisay',
        avatar: userAvatar,
        role: 'Employee'
      },
      navItems: [
        { path: '/dashboard/employee/tasks', text: 'Tasks', icon: 'fas fa-tasks' },
        { path: '/dashboard/employee/schedule', text: 'Schedule', icon: 'fas fa-calendar-alt' },
        { path: '/dashboard/employee/team', text: 'Team', icon: 'fas fa-users' },
        { path: '/dashboard/employee/reports', text: 'Reports', icon: 'fas fa-chart-bar' }
      ],
      notifications: [
        { id: 1, message: 'New task assigned: Project Review', icon: 'fas fa-tasks', time: '10 min ago', read: false },
        { id: 2, message: 'Your leave request has been approved', icon: 'fas fa-calendar-check', time: '2 hours ago', read: true },
        { id: 3, message: 'Team meeting at 3:00 PM', icon: 'fas fa-users', time: '1 day ago', read: true }
      ]
    }
  },
  computed: {
    userInitials() {
      return this.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    },
    unreadNotifications() {
      return this.notifications.filter(n => !n.read).length
    }
  },
  methods: {
    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      if (this.showNotifications) this.showProfileDropdown = false
    },
    toggleProfileDropdown() {
      this.showProfileDropdown = !this.showProfileDropdown
      if (this.showProfileDropdown) this.showNotifications = false
    },
    markAllAsRead() {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }))
    },
    logout() {
      this.$router.push('/login')
    }
  },
  mounted() {
    document.addEventListener('click', e => {
      if (!this.$el.contains(e.target)) {
        this.showNotifications = false
        this.showProfileDropdown = false
      }
    })
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.employee-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 0.5rem 2rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.brand-section {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.brand-link:hover {
  transform: scale(1.02);
}

.logo {
  height: 40px;
  width: 40px;
  margin-right: 0.75rem;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.company-name {
  font-weight: 800;
  font-size: 1.35rem;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex-grow: 1;
  margin-left: 3rem;
}

.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 1rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  position: relative;
  border-radius: 8px;
}

.nav-link:hover {
  color: #334155;
  background: rgba(241, 245, 249, 0.6);
}

.nav-link.active {
  color: #10b981;
}

.nav-link.active .nav-highlight {
  opacity: 1;
  transform: scaleX(1);
}

.nav-highlight {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  border-radius: 3px 3px 0 0;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: center;
  transition: all 0.3s ease;
}

.nav-icon {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.profile-section {
  display: flex;
  align-items: center;
  position: relative;
  gap: 1.5rem;
}

.notifications {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: rgba(241, 245, 249, 0.6);
  color: #334155;
}

.notification-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  padding: 0 5px;
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.notifications-dropdown {
  position: absolute;
  right: 0;
  top: 3rem;
  width: 360px;
  max-height: 400px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 100;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
}

.mark-all-read {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.mark-all-read:hover {
  color: #059669;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background-color: #f0fdf4;
}

.notification-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex-grow: 1;
}

.notification-content p {
  margin: 0 0 0.25rem 0;
  color: #334155;
  font-size: 0.9rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
  display: block;
}

.empty-notifications {
  padding: 2rem 1rem;
  text-align: center;
  color: #94a3b8;
}

.empty-notifications i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
}

.empty-notifications p {
  margin: 0;
  font-size: 0.9rem;
}

.profile-dropdown {
  position: relative;
}

.profile-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 600;
  color: #334155;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.profile-btn:hover {
  background: rgba(241, 245, 249, 0.6);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  height: 36px;
  width: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
  border: 2px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  height: 36px;
  width: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  user-select: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-name {
  margin-right: 0.5rem;
  font-size: 0.95rem;
}

.dropdown-icon {
  font-size: 0.75rem;
  color: #94a3b8;
  transition: transform 0.3s ease;
}

.profile-btn:hover .dropdown-icon {
  color: #64748b;
}

.profile-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 3.5rem;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  width: 280px;
  z-index: 100;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.dropdown-header {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.dropdown-avatar {
  flex-shrink: 0;
}

.dropdown-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-avatar .avatar-placeholder {
  width: 48px;
  height: 48px;
  font-size: 1.1rem;
  margin-right: 0;
}

.dropdown-user-info {
  overflow: hidden;
}

.dropdown-user-info h5 {
  margin: 0;
  font-size: 1rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.8rem;
  color: #64748b;
  display: block;
  margin-top: 0.25rem;
}

.dropdown-divider {
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  margin: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  color: #475569;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.dropdown-item i {
  margin-right: 0.75rem;
  width: 20px;
  text-align: center;
  color: #94a3b8;
}

.dropdown-item:hover {
  background-color: #f8fafc;
  color: #334155;
}

.dropdown-item:hover i {
  color: #10b981;
}

.logout-btn {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  color: #ef4444;
  font-weight: 600;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #fef2f2;
}

.logout-btn i {
  color: #ef4444;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .nav-menu {
    margin-left: 1.5rem;
  }
  
  .nav-list {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .employee-header {
    padding: 0.5rem 1rem;
  }
  
  .company-name {
    display: none;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-icon {
    margin-right: 0;
    font-size: 1.1rem;
  }
  
  .user-name {
    display: none;
  }
  
  .dropdown-icon {
    display: none;
  }
  
  .notifications-dropdown {
    width: 280px;
  }
}
</style>