const express = require('express');
const router = express.Router();

const deptController = require('../controllers/department.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createDepartmentSchema, updateDepartmentSchema } = require('../validations/user.validation');

// Public route for registration dropdown
router.get('/public', deptController.getPublicDepartments);

router.use(protect);

router.get('/', deptController.getDepartments);
router.get('/:id', deptController.getDepartmentById);
router.post('/', authorize('superadmin'), validate(createDepartmentSchema), deptController.createDepartment);
router.patch('/:id', authorize('superadmin'), validate(updateDepartmentSchema), deptController.updateDepartment);
router.patch('/:id/assign-manager', authorize('superadmin'), deptController.assignManager);

module.exports = router;
