import { defineStore } from 'pinia';
import employeeApi from '@/api/employee';

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    pendingApprovals: [],
    notifications: [],
    allEmployees: [],
  }),

  actions: {
    // Fetch pending approvals
    async fetchPendingApprovals() {
      try {
        const { data } = await employeeApi.getPendingApprovals();
        this.pendingApprovals = data;
        return data;
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      }
    },

    // Approve an employee
    async approveEmployee(id) {
      try {
        await employeeApi.approveEmployee(id);
        this.pendingApprovals = this.pendingApprovals.filter(emp => emp.id !== id);
        await Promise.all([
          this.fetchPendingApprovals(),
          this.fetchAllEmployees(),
        ]);
      } catch (error) {
        console.error('Error approving employee:', error);
        throw error;
      }
    },

    // Reject an employee
    async rejectEmployee(id) {
      try {
        await employeeApi.rejectEmployee(id);
        this.pendingApprovals = this.pendingApprovals.filter(emp => emp.id !== id);
        await this.fetchPendingApprovals();
      } catch (error) {
        console.error('Error rejecting employee:', error);
        throw error;
      }
    },

    // Fetch notifications
    async fetchNotifications() {
      try {
        const { data } = await employeeApi.getNotifications();
        this.notifications = data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },

    // Mark notification as read
    async markNotificationRead(id) {
      try {
        await employeeApi.markAsRead(id);
        const notification = this.notifications.find(n => n.id === id);
        if (notification) notification.read = true;
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    },

    // Fetch all employees
    async fetchAllEmployees() {
      try {
        const { data } = await employeeApi.getAllEmployees();
        this.allEmployees = data;
      } catch (error) {
        console.error('Error fetching all employees:', error);
        throw error;
      }
    },
  },

  getters: {
    // Get unread notifications
    unreadNotifications: (state) => state.notifications.filter(n => !n.read),
    
    // Count unread notifications
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
  },
});