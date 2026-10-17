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

router.use(protect);

router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/change-password', validate(changePasswordSchema), userController.changePassword);

router.get('/pending', authorize('manager', 'superadmin'), userController.getPendingEmployees);
router.patch('/:id/approve', authorize('manager', 'superadmin'), validate(approveEmployeeSchema), userController.approveEmployee);
router.patch('/:id/reject', authorize('manager', 'superadmin'), validate(rejectEmployeeSchema), userController.rejectEmployee);
router.patch('/:id/suspend', authorize('superadmin'), userController.suspendUser);

router.get('/', authorize('employee', 'manager', 'superadmin'), userController.getEmployees);
router.get('/:id', userController.getEmployeeById);

module.exports = router;
