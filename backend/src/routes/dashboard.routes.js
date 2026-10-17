const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/manager', authorize('manager', 'superadmin'), dashboardController.getManagerDashboard);
router.get('/employee', authorize('employee'), dashboardController.getEmployeeDashboard);
router.get('/admin', authorize('superadmin'), dashboardController.getAdminDashboard);

module.exports = router;
