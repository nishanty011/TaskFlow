const express = require('express');
const router = express.Router();

const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.use(authorize('manager', 'superadmin'));

router.get('/export', reportController.exportReport);

module.exports = router;
