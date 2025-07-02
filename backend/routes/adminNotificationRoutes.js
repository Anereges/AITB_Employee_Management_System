// routes/adminNotificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// GET /api/admin/notifications/unread
router.get('/unread', async (req, res) => {
  try {
    const notifications = await notificationService.getUnreadNotifications();
    const unreadCount = await notificationService.getUnreadCount();

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// You can add more routes here for marking as read, etc.

module.exports = router;
