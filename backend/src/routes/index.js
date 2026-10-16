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
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/departments', departmentRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/submissions', submissionRoutes);
// router.use('/feedbacks', feedbackRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/notifications', notificationRoutes);

module.exports = router;
