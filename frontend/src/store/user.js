// src/store/user.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  actions: {
    async fetchPendingRegistrations() {
      try {
        const response = await axios.get('/api/admin/registrations/pending');
        return response.data;
      } catch (error) {
        console.error('Error fetching pending registrations:', error);
        throw error;
      }
    },
    
    async fetchRecentActivities() {
      try {
        const response = await axios.get('/api/admin/notifications');
        return response.data;
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        throw error;
      }
    },
    
    async approveUser(userId) {
      try {
        const response = await axios.patch(`/api/admin/approve-user/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Error approving user:', error);
        throw error;
      }
    },
    
    async rejectUser({ userId, reason }) {
      try {
        const response = await axios.delete(`/api/admin/reject-user/${userId}`, { 
          data: { reason } 
        });
        return response.data;
      } catch (error) {
        console.error('Error rejecting user:', error);
        throw error;
      }
    },
    
    async exportActivities() {
      try {
        const response = await axios.get('/api/admin/notifications/export', {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        console.error('Error exporting activities:', error);
        throw error;
      }
    }
  }
});