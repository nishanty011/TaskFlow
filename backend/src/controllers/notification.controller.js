const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Notification } = require('../models');

// GET /api/notifications - User notifications with pagination and unread count
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

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, 'Notifications fetched successfully', {
      total,
      unreadCount,
      page: parseInt(page),
      limit: parseInt(limit),
      notifications
    })
  );
});

// PATCH /api/notifications/:id/read - Mark single notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    isRead: false
  });

  res.status(200).json(
    new ApiResponse(200, 'Notification marked as read', {
      notification,
      unreadCount
    })
  );
});

// PATCH /api/notifications/read-all - Mark all notifications as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json(
    new ApiResponse(200, 'All notifications marked as read', { unreadCount: 0 })
  );
});

// DELETE /api/notifications/:id - Delete a single notification
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Notification deleted successfully', { notificationId: req.params.id })
  );
});

// DELETE /api/notifications/clear-all - Clear all read notifications
const clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user._id,
    isRead: true
  });

  res.status(200).json(
    new ApiResponse(200, `${result.deletedCount} read notifications cleared`)
  );
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
};
