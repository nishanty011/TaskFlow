const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Sirf manager aur superadmin export kar sakte hain
router.use(protect);
router.use(authorize('manager', 'superadmin'));

// GET /api/reports/export?type=tasks|employees
router.get('/export', reportController.exportReport);

module.exports = router;
