const express = require('express');
const router = express.Router();

const deptController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validations/user.validation');

// Saare routes protected hain
router.use(protect);

// Get all departments - superadmin sab dekhe, manager apna
router.get('/', deptController.getDepartments);

// Get specific department detail
router.get('/:id', deptController.getDepartmentById);

// Create department - sirf superadmin
router.post('/', authorize('superadmin'), validate(createDepartmentSchema), deptController.createDepartment);

// Update department - sirf superadmin
router.patch('/:id', authorize('superadmin'), validate(updateDepartmentSchema), deptController.updateDepartment);

// Assign manager to department - sirf superadmin
router.patch('/:id/assign-manager', authorize('superadmin'), deptController.assignManager);

module.exports = router;
