<script setup>
import { ref } from 'vue';

// Define props for the notification count
defineProps({
  count: {
    type: Number,
    default: 0
  }
});

// Toggle notification dropdown
const notificationsOpen = ref(false);
const notifications = ref([
  { id: 1, title: 'New order received', time: '2 min ago', read: false },
  { id: 2, title: 'Database backup completed', time: '1 hour ago', read: true },
  { id: 3, title: 'New user registered', time: '3 hours ago', read: true }
]);

// Toggle dropdown visibility
const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value;
};

// Mark all notifications as read
const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
};
</script>

<template>
  <div class="relative">
    <!-- Notification button with badge -->
    <button 
      @click="toggleNotifications"
      class="notifications-btn relative"
    >
      <i class="fas fa-bell"></i>
      <!-- Display count badge if there are unread notifications -->
      <span 
        v-if="count > 0"
        class="notification-badge"
      >
        {{ count }}
      </span>
    </button>

    <!-- Notifications dropdown -->
    <div 
      v-if="notificationsOpen"
      class="notifications-dropdown"
    >
      <div class="notifications-header">
        <h3>Notifications</h3>
        <!-- Mark all as read button -->
        <button 
          @click="markAllAsRead"
          class="mark-all-read text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Mark all as read
        </button>
      </div>
      <div class="notifications-list">
        <!-- Loop through notifications -->
        <div 
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
        >
          <div class="notification-icon text-blue-500">
            <i class="fas" :class="notification.icon || 'fa-info-circle'"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-time">{{ notification.time }}</div>
          </div>
        </div>
      </div>
      <!-- Footer with 'View all notifications' link -->
      <div class="notifications-footer">
        <a href="#" class="view-all text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          View all notifications
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-btn {
  @apply p-2 rounded-full text-gray-600 hover:text-gray-900;
  @apply hover:bg-gray-100 transition-colors;
  @apply dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700;
  @apply relative;
}

.notification-badge {
  @apply absolute -top-1 -right-1;
  @apply bg-red-500 text-white text-xs;
  @apply rounded-full h-5 w-5 flex items-center justify-center;
}

.notifications-dropdown {
  @apply absolute right-0 mt-2 w-72;
  @apply bg-white rounded-lg shadow-xl;
  @apply dark:bg-gray-800 dark:border dark:border-gray-700;
  @apply z-50;
}

.notifications-header {
  @apply flex justify-between items-center p-3 border-b;
  @apply dark:border-gray-700;
}

.notifications-header h3 {
  @apply font-semibold text-gray-800 dark:text-white;
}

.notifications-list {
  @apply max-h-80 overflow-y-auto;
}

.notification-item {
  @apply flex items-start p-3 hover:bg-gray-50;
  @apply dark:hover:bg-gray-700;
  @apply border-b dark:border-gray-700;
}

.notification-item.unread {
  @apply bg-blue-50 dark:bg-gray-700;
}

.notification-content {
  @apply flex-1;
}

.notification-title {
  @apply text-sm font-medium text-gray-800 dark:text-gray-200;
}

.notification-time {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.notifications-footer {
  @apply p-2 text-center border-t;
  @apply dark:border-gray-700;
}
</style>
