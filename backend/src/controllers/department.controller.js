const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Department, User } = require('../models');
const { USER_ROLES, USER_STATUS } = require('../utils/constants');

// GET /api/departments/public - Public departments list for registration dropdown
const getPublicDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true })
    .select('_id name code description')
    .sort({ name: 1 });

  res.status(200).json(
    new ApiResponse(200, 'Public departments retrieved successfully', { departments })
  );
});

// GET /api/departments - Departments list scoped by role
const getDepartments = asyncHandler(async (req, res) => {
  const filter = req.user.role === USER_ROLES.SUPERADMIN
    ? {}
    : { _id: req.user.department };

  const departments = await Department.find(filter)
    .populate('manager', 'name email designation avatar');

  res.status(200).json(
    new ApiResponse(200, 'Departments retrieved successfully', { departments })
  );
});

// GET /api/departments/:id - Department detail with employee count
const getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id)
    .populate('manager', 'name email designation avatar phone');

  if (!dept) {
    throw new ApiError(404, 'Department not found');
  }

  if (
    req.user.role === USER_ROLES.MANAGER &&
    dept._id.toString() !== req.user.department?._id?.toString()
  ) {
    throw new ApiError(403, 'You can only view details of your own department');
  }

  const employeeCount = await User.countDocuments({
    department: dept._id,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.ACTIVE
  });

  const pendingCount = await User.countDocuments({
    department: dept._id,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.PENDING_APPROVAL
  });

  res.status(200).json(
    new ApiResponse(200, 'Department detail', {
      department: dept,
      stats: { employeeCount, pendingCount }
    })
  );
});

// POST /api/departments - Create new department (Superadmin only)
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;

  const existing = await Department.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { code: code.toUpperCase() }
    ]
  });

  if (existing) {
    throw new ApiError(409, 'A department with this name or code already exists');
  }

  const dept = await Department.create({
    name,
    code: code.toUpperCase(),
    description: description || ''
  });

  res.status(201).json(
    new ApiResponse(201, 'New department created successfully', { department: dept })
  );
});

// PATCH /api/departments/:id - Update department details (Superadmin only)
const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id);
  if (!dept) {
    throw new ApiError(404, 'Department not found');
  }

  const { name, code, description, isActive } = req.body;

  if (name) dept.name = name;
  if (code) dept.code = code.toUpperCase();
  if (description !== undefined) dept.description = description;
  if (isActive !== undefined) dept.isActive = isActive;

  await dept.save();

  res.status(200).json(
    new ApiResponse(200, 'Department updated successfully', { department: dept })
  );
});

// PATCH /api/departments/:id/assign-manager - Assign department manager (Superadmin only)
const assignManager = asyncHandler(async (req, res) => {
  const { managerId } = req.body;

  const dept = await Department.findById(req.params.id);
  if (!dept) throw new ApiError(404, 'Department not found');

  const manager = await User.findById(managerId);
  if (!manager) throw new ApiError(404, 'User not found');

  if (manager.role !== USER_ROLES.MANAGER && manager.role !== USER_ROLES.SUPERADMIN) {
    throw new ApiError(400, 'Only users with manager or superadmin role can be assigned to a department');
  }

  dept.manager = manager._id;
  await dept.save();

  manager.department = dept._id;
  await manager.save();

  res.status(200).json(
    new ApiResponse(200, `${manager.name} assigned as manager of ${dept.name}`, {
      department: dept,
      manager: { _id: manager._id, name: manager.name, email: manager.email }
    })
  );
});

module.exports = {
  getPublicDepartments,
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  assignManager
};
