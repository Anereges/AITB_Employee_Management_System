import { ref } from 'vue';

export function useNotification() {
  const notifications = ref([]);
  const unreadNotifications = ref(0);

  const addNotification = (notification) => {
    notifications.value.unshift(notification);
    if (!notification.read) {
      unreadNotifications.value++;
    }
  };

  const markAsRead = (index) => {
    if (!notifications.value[index].read) {
      notifications.value[index].read = true;
      unreadNotifications.value--;
    }
  };

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    unreadNotifications.value = 0;
  };

  return {
    notifications,
    unreadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead
  };
}