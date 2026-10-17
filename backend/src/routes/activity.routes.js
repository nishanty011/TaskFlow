const express = require('express');
const router = express.Router();

const activityController = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/stats', authorize('manager', 'superadmin'), activityController.getActivityStats);
router.get('/', activityController.getActivities);

module.exports = router;
