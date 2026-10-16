const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../utils/constants');

// Notification schema - in-app alerts aur reminders ke liye
const notificationSchema = new mongoose.Schema(
  {
    // Notification kis user ke liye hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID zaroori hai']
    },
    // Kis type ki alert hai
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: [true, 'Notification type zaroori hai']
    },
    title: {
      type: String,
      required: [true, 'Notification title zaroori hai'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message zaroori hai'],
      trim: true
    },
    // Frontend redirect link (jaise /tasks/123)
    link: {
      type: String,
      default: ''
    },
    // Read/Unread flag
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes - user alerts aur unread notifications fast filter karne ke liye
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// TTL index - purani notifications 90 dino baad automatic delete ho jayengi
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
