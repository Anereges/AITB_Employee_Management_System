import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref([
    {
      id: 1,
      message: 'New employee registration requires approval',
      timestamp: new Date(),
      read: false,
      action: '/admin/approvals'
    },
    // More alerts...
  ]);

  const unreadCount = computed(() => alerts.value.filter(a => !a.read).length);

  function markAsRead(id) {
    const alert = alerts.value.find(a => a.id === id);
    if (alert) alert.read = true;
  }

  function markAllAsRead() {
    alerts.value.forEach(a => a.read = true);
  }

  function addAlert(alert) {
    alerts.value.unshift({
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...alert
    });
  }

  return { alerts, unreadCount, markAsRead, markAllAsRead, addAlert };
});