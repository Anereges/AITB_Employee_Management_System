const AdminNotification = require('../models/AdminNotification');
const logger = require('../utils/logger'); // Ensure this logger exists and is configured

module.exports = {
  /**
   * Create a new admin notification
   * @param {Object} data - Notification data
   * @param {String} data.message - Notification message
   * @param {String} data.employeeId - Related employee ID
   * @param {String} [data.type='general'] - Notification type
   * @param {Object} [data.metadata={}] - Additional metadata
   * @returns {Promise<Object>} Created notification
   */
  async createAdminNotification(data) {
    try {
      const notification = await AdminNotification.create({
        message: data.message,
        employeeId: data.employeeId,
        type: data.type || 'general',
        metadata: data.metadata || {},
        status: 'unread'
      });
      
      logger.info('Admin notification created', { 
        notificationId: notification._id,
        employeeId: data.employeeId
      });
      return notification;
    } catch (error) {
      logger.error('Error creating admin notification', {
        error: error.message,
        stack: error.stack,
        notificationData: data
      });
      throw error;
    }
  },

  /**
   * Mark notification as handled
   * @param {Object} data - Handling data
   * @param {String} data.employeeId - Employee ID
   * @param {String} data.type - Notification type
   * @param {String} data.handledBy - Admin ID who handled it
   * @param {String} data.action - Action taken
   * @param {String} [data.reason] - Optional reason
   * @returns {Promise<Object>} Updated notification
   */
  async markAsHandled(data) {
    try {
      const update = {
        status: 'read',
        handledAt: new Date(),
        handledBy: data.handledBy,
        action: data.action
      };

      if (data.reason) update.reason = data.reason;

      const notification = await AdminNotification.findOneAndUpdate(
        {
          employeeId: data.employeeId,
          type: data.type,
          status: 'unread'
        },
        update,
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      logger.info('Notification marked as handled', {
        notificationId: notification._id,
        handledBy: data.handledBy
      });
      return notification;
    } catch (error) {
      logger.error('Error marking notification as handled', {
        error: error.message,
        stack: error.stack,
        handlingData: data
      });
      throw error;
    }
  },

  /**
   * Get all unread notifications
   * @returns {Promise<Array>} Array of unread notifications
   */
  async getUnreadNotifications() {
    try {
      const notifications = await AdminNotification.find({ status: 'unread' })
        .sort({ createdAt: -1 })
        .populate('employeeId', 'fullName email')
        .populate('readBy', 'fullName')
        .lean();
      logger.info('Fetched unread notifications', {
        count: notifications.length
      });
      return notifications;
    } catch (error) {
      logger.error('Error fetching unread notifications', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Mark specific notification as read
   * @param {String} notificationId - Notification ID
   * @param {String} adminId - Admin ID who read it
   * @returns {Promise<Object>} Updated notification
   */
  async markNotificationAsRead(notificationId, adminId) {
    try {
      const notification = await AdminNotification.findByIdAndUpdate(
        notificationId,
        {
          status: 'read',
          readAt: new Date(),
          readBy: adminId
        },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      logger.info('Notification marked as read', {
        notificationId,
        adminId
      });
      return notification;
    } catch (error) {
      logger.error('Error marking notification as read', {
        error: error.message,
        stack: error.stack,
        notificationId
      });
      throw error;
    }
  },

  /**
   * Get count of unread notifications
   * @returns {Promise<Number>} Count of unread notifications
   */
  async getUnreadCount() {
    try {
      const count = await AdminNotification.countDocuments({ status: 'unread' });
      return count;
    } catch (error) {
      logger.error('Error getting unread notifications count', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  /**
   * Find registration-related notifications
   * @param {Object} filter - Query filter object
   * @returns {Promise<Array>} Array of matching notifications
   */
  async findRegistrationNotification(filter) {
    try {
      const notifications = await AdminNotification.find(filter)
        .sort({ createdAt: -1 })
        .populate('employeeId', 'fullName email')
        .lean();
      logger.info('Fetched registration notifications', { count: notifications.length });
      return notifications;
    } catch (error) {
      logger.error('Error fetching registration notifications', {
        error: error.message,
        stack: error.stack,
        filter
      });
      throw error;
    }
  }
};
