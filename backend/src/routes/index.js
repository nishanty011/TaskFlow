const express = require('express');
const router = express.Router();

// Health check endpoint - API chal rahi hai ya nahi
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API chal rahi hai',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Sub-routes mounting
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const departmentRoutes = require('./department.routes');
const taskRoutes = require('./task.routes');
const submissionRoutes = require('./submission.routes');
const feedbackRoutes = require('./feedback.routes');
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/tasks', taskRoutes);
router.use('/submissions', submissionRoutes);
router.use('/feedbacks', feedbackRoutes);
const notificationRoutes = require('./notification.routes');
const activityRoutes = require('./activity.routes');
router.use('/notifications', notificationRoutes);
router.use('/activities', activityRoutes);
const dashboardRoutes = require('./dashboard.routes');
const reportRoutes = require('./report.routes');
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
