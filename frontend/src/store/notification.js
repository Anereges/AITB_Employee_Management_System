// src/store/notification.js
import { defineStore } from 'pinia'
import api from '@/api/axios'  // your custom axios instance with baseURL and auth

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    employeeNotifications: 0
  }),
  actions: {
    async fetchNotifications() {
      try {
        // Updated API endpoint to match backend route
        const response = await api.get('/api/admin/notifications/unread')
        const data = response.data

        this.notifications = data.notifications || []
        this.unreadCount = data.unreadCount || 0
        this.employeeNotifications = data.employeeNotifications || 0
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    },
    markAllAsRead() {
      this.notifications = this.notifications.map(n => ({ ...n, read: true }))
      this.unreadCount = 0
    },
    dismissNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },
    addNotification(notification) {
      this.notifications.unshift(notification)
      this.unreadCount++
    }
  }
})
