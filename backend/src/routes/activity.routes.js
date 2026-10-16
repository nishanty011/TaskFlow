const express = require('express');
const router = express.Router();

const activityController = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Saare activity routes protected hain
router.use(protect);

// Activity stats - GET /api/activities/stats (manager/superadmin only)
router.get('/stats', authorize('manager', 'superadmin'), activityController.getActivityStats);

// Activity timeline audit trail - GET /api/activities
router.get('/', activityController.getActivities);

module.exports = router;
