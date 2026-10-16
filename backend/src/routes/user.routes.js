const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  approveEmployeeSchema,
  rejectEmployeeSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('../validations/user.validation');

// Saare routes protected hain
router.use(protect);

// Current user apna profile update kare
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

// Current user apna password change kare
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);

// Manager ke liye - apne department ke pending employees
router.get('/pending', authorize('manager', 'superadmin'), userController.getPendingEmployees);

// Manager employee ko approve kare
router.patch('/:id/approve', authorize('manager', 'superadmin'), validate(approveEmployeeSchema), userController.approveEmployee);

// Manager employee ko reject kare
router.patch('/:id/reject', authorize('manager', 'superadmin'), validate(rejectEmployeeSchema), userController.rejectEmployee);

// Superadmin employee/manager ko suspend kare
router.patch('/:id/suspend', authorize('superadmin'), userController.suspendUser);

// Employee directory - manager apne dept ka dekhe, superadmin sab dekhe
router.get('/', authorize('manager', 'superadmin'), userController.getEmployees);

// Specific employee detail
router.get('/:id', userController.getEmployeeById);

module.exports = router;
