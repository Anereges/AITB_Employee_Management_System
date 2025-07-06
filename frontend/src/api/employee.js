import api from './axios';

export default {
  /**
   * Get all pending employee approvals
   * @returns {Promise<Array>} List of pending employees
   */
  getPendingApprovals() {
    return api.get('/employees/pending'); // corrected path
  },

  /**
   * Approve an employee
   * @param {string} id - Employee ID
   * @returns {Promise} 
   */
  approveEmployee(id) {
    return api.put(`/employees/${id}/approve`); // corrected path
  },

  /**
   * Reject an employee
   * @param {string} id - Employee ID
   * @returns {Promise}
   */
  rejectEmployee(id) {
    return api.delete(`/employees/${id}/reject`); // corrected path
  },

  /**
   * Get notifications for admin
   * @returns {Promise<Array>} List of notifications
   */
  getNotifications() {
    return api.get('/admin/notifications'); // keep as is
  },

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise}
   */
  markAsRead(id) {
    return api.put(`/admin/notifications/${id}/read`); // keep as is
  },

  /**
   * Get all employees
   * @returns {Promise<Array>} List of all employees
   */
  getAllEmployees() {
    return api.get('/employees'); // corrected path
  }
};
