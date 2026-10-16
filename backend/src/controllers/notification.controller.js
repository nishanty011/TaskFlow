const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Notification } = require('../models');

// 1. GET /api/notifications
// Logged in user ke saare notifications (paginated + unread count)
const getMyNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;

  const filter = { user: req.user._id };
  if (isRead !== undefined) {
    filter.isRead = isRead === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Navbar badge ke liye total unread count
  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, 'Notifications fetch ho gayi', {
      total,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
      notifications
    })
  );
});

// 2. PATCH /api/notifications/:id/read
// Single notification ko read mark karein
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification nahi mila');
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, 'Notification read mark ho gaya', {
      notification,
      unreadCount
    })
  );
});

// 3. PATCH /api/notifications/read-all
// Saare unread notifications ko ek sath read mark karein
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json(
    new ApiResponse(200, 'Saare notifications read mark ho gaye', { unreadCount: 0 })
  );
});

// 4. DELETE /api/notifications/:id
// Single notification delete karein
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification nahi mila');
  }

  res.status(200).json(
    new ApiResponse(200, 'Notification delete ho gaya', { notificationId: req.params.id })
  );
});

// 5. DELETE /api/notifications/clear-all
// Saare read notifications delete karein
const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
    isRead: true
  });

  res.status(200).json(
    new ApiResponse(200, `${result.deletedCount} read notifications clear ho gaye`)
  );
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
};
