const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Saare dashboard endpoints protected hain
router.use(protect);

// 1. Manager department dashboard - GET /api/dashboard/manager
router.get('/manager', authorize('manager', 'superadmin'), dashboardController.getManagerDashboard);

// 2. Employee personal dashboard - GET /api/dashboard/employee
router.get('/employee', authorize('employee'), dashboardController.getEmployeeDashboard);

// 3. Superadmin organization dashboard - GET /api/dashboard/admin
router.get('/admin', authorize('superadmin'), dashboardController.getAdminDashboard);

module.exports = router;
