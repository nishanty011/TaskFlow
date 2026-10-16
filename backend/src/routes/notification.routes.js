const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

// Saare notification routes logged-in users ke liye protected hain
router.use(protect);

// 1. Logged in user ke saare notifications fetch karein - GET /api/notifications
router.get('/', notificationController.getMyNotifications);

// 2. Bulk: Saare unread notifications ko read mark karein - PATCH /api/notifications/read-all
router.patch('/read-all', notificationController.markAllAsRead);

// 3. Bulk: Saare read notifications ko delete karein - DELETE /api/notifications/clear-all
router.delete('/clear-all', notificationController.clearReadNotifications);

// 4. Single notification ko read mark karein - PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// 5. Single notification ko delete karein - DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
