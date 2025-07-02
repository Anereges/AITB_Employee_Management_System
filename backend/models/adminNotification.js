const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['registration', 'leave', 'payroll', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  metadata: {
    type: Object,
    default: {}
  },
  handledAt: Date,
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  action: String, // 'approved', 'rejected', etc.
  reason: String,
  readAt: Date,
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
adminNotificationSchema.index({ employeeId: 1 });
adminNotificationSchema.index({ status: 1 });
adminNotificationSchema.index({ type: 1 });
adminNotificationSchema.index({ createdAt: -1 });

const AdminNotification = mongoose.model('AdminNotification', adminNotificationSchema);

module.exports = AdminNotification;