const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { User, Department, Notification, ActivityLog } = require('../models');
const { USER_ROLES, USER_STATUS, NOTIFICATION_TYPE, ACTIVITY_ACTIONS, ENTITY_TYPES } = require('../utils/constants');
const { emitToUser } = require('../config/socket');

// Helper: get all department IDs that a manager manages
const getManagedDepartmentIds = async (managerId) => {
  const departments = await Department.find({ manager: managerId }).select('_id');
  return departments.map(d => d._id);
};

// 1. GET /api/users/pending
// 1. GET /api/users/pending
// Returns pending approval users: Superadmin sees all pending (employees & managers), Manager sees only employees in their departments
const getPendingEmployees = asyncHandler(async (req, res) => {
  let deptFilter = {};
  let roleFilter = USER_ROLES.EMPLOYEE;

  if (req.user.role === USER_ROLES.SUPERADMIN) {
    // Superadmin sees all pending employees and managers across all departments
    roleFilter = { $in: [USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER] };
  } else {
    // Manager: find all departments this manager manages
    const managedDeptIds = await getManagedDepartmentIds(req.user._id);
    const ownDeptId = req.user.department?._id || req.user.department;
    if (ownDeptId) {
      const ownIdStr = ownDeptId.toString();
      const alreadyIncluded = managedDeptIds.some(id => id.toString() === ownIdStr);
      if (!alreadyIncluded) managedDeptIds.push(ownDeptId);
    }
    deptFilter = { department: { $in: managedDeptIds } };
  }

  const pendingUsers = await User.find({
    ...deptFilter,
    role: roleFilter,
    status: USER_STATUS.PENDING_APPROVAL
  })
    .select('name email role designation phone skills createdAt department')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Pending approval users', {
      count: pendingUsers.length,
      employees: pendingUsers
    })
  );
});

// 2. PATCH /api/users/:id/approve
// Approves a pending user (Managers require Superadmin; Employees can be approved by Manager or Superadmin)
const approveEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id).populate('department');

  if (!employee) throw new ApiError(404, 'User not found');

  // Manager registration requests can ONLY be approved by Superadmin
  if (employee.role === USER_ROLES.MANAGER && req.user.role !== USER_ROLES.SUPERADMIN) {
    throw new ApiError(403, 'Only Super Admin can approve Manager registration requests');
  }

  // Check authorization for Employee approval
  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    const managedDeptIds = await getManagedDepartmentIds(req.user._id);
    const ownDeptId = req.user.department?._id || req.user.department;
    if (ownDeptId) {
      const ownIdStr = ownDeptId.toString();
      const alreadyIncluded = managedDeptIds.some(id => id.toString() === ownIdStr);
      if (!alreadyIncluded) managedDeptIds.push(ownDeptId);
    }

    const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
    const isAuthorized = managedDeptIds.some(id => id.toString() === empDeptId);

    if (!isAuthorized) {
      throw new ApiError(403, 'You can only approve employees in departments you manage');
    }
  }

  if (employee.status !== USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(400, `This user's status is already '${employee.status}'`);
  }

  // Set status to active
  employee.status = USER_STATUS.ACTIVE;
  employee.approvedBy = req.user._id;
  employee.approvedAt = new Date();
  await employee.save();

  // If approved user is a Manager, assign them as manager of their department
  if (employee.role === USER_ROLES.MANAGER && employee.department) {
    const deptId = employee.department._id || employee.department;
    await Department.findByIdAndUpdate(deptId, { manager: employee._id });
  }

  // Notify user - account approved
  const isMgr = employee.role === USER_ROLES.MANAGER;
  const notification = await Notification.create({
    user: employee._id,
    type: NOTIFICATION_TYPE.EMPLOYEE_APPROVED,
    title: isMgr ? 'Manager Account Approved!' : 'Account Approved!',
    message: isMgr
      ? `Your Manager account for ${employee.department?.name || 'your department'} has been approved by Super Admin. You can now access the Manager Portal!`
      : `${req.user.name} approved your account. You can now access TaskFlow!`,
    link: isMgr ? '/manager/dashboard' : '/dashboard'
  });

  emitToUser(employee._id.toString(), 'notification', notification);

  // Activity log record
  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.USER_APPROVED,
    entityType: ENTITY_TYPES.USER,
    entityId: employee._id,
    department: empDeptId,
    meta: { userEmail: employee.email, role: employee.role }
  });

  res.status(200).json(
    new ApiResponse(200, `${employee.name}'s account has been approved`, {
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        approvedAt: employee.approvedAt
      }
    })
  );
});

// 3. PATCH /api/users/:id/reject
// Rejects a pending user (Managers require Superadmin; Employees can be rejected by Manager or Superadmin)
const rejectEmployee = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const employee = await User.findById(req.params.id).populate('department');

  if (!employee) throw new ApiError(404, 'User not found');

  // Manager registration requests can ONLY be rejected by Superadmin
  if (employee.role === USER_ROLES.MANAGER && req.user.role !== USER_ROLES.SUPERADMIN) {
    throw new ApiError(403, 'Only Super Admin can reject Manager registration requests');
  }

  // Check authorization for Employee rejection
  if (req.user.role !== USER_ROLES.SUPERADMIN) {
    const managedDeptIds = await getManagedDepartmentIds(req.user._id);
    const ownDeptId = req.user.department?._id || req.user.department;
    if (ownDeptId) {
      const ownIdStr = ownDeptId.toString();
      const alreadyIncluded = managedDeptIds.some(id => id.toString() === ownIdStr);
      if (!alreadyIncluded) managedDeptIds.push(ownDeptId);
    }

    const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
    const isAuthorized = managedDeptIds.some(id => id.toString() === empDeptId);

    if (!isAuthorized) {
      throw new ApiError(403, 'You can only reject employees in departments you manage');
    }
  }

  if (employee.status !== USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(400, `This user's status is already '${employee.status}'`);
  }

  employee.status = USER_STATUS.REJECTED;
  await employee.save();

  // Notify user of rejection
  const notification = await Notification.create({
    user: employee._id,
    type: NOTIFICATION_TYPE.EMPLOYEE_REJECTED,
    title: 'Registration Request Rejected',
    message: `Your registration request was rejected. Reason: ${reason || 'Not specified'}`,
    link: '/waiting-approval'
  });

  emitToUser(employee._id.toString(), 'notification', notification);

  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.USER_REJECTED,
    entityType: ENTITY_TYPES.USER,
    entityId: employee._id,
    department: empDeptId,
    meta: { reason, employeeEmail: employee.email }
  });

  res.status(200).json(
    new ApiResponse(200, `${employee.name}'s registration request was rejected`, {
      employee: { _id: employee._id, name: employee.name, status: employee.status }
    })
  );
});

// 4. GET /api/users
// Returns employees scoped by role: manager sees managed departments, superadmin sees all
const getEmployees = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    filter.department = req.user.department?._id || req.user.department;
    filter.status = USER_STATUS.ACTIVE;
  } else if (req.user.role === USER_ROLES.MANAGER) {
    // Include all departments this manager manages
    const managedDeptIds = await getManagedDepartmentIds(req.user._id);
    const ownDeptId = req.user.department?._id || req.user.department;
    if (ownDeptId) {
      const ownIdStr = ownDeptId.toString();
      const alreadyIncluded = managedDeptIds.some(id => id.toString() === ownIdStr);
      if (!alreadyIncluded) managedDeptIds.push(ownDeptId);
    }
    filter.department = { $in: managedDeptIds };
    filter.role = USER_ROLES.EMPLOYEE;
  } else if (req.user.role === USER_ROLES.SUPERADMIN) {
    filter.role = { $in: [USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER] };
  }

  // Optional filters
  if (status) filter.status = status;

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { designation: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);

  const employees = await User.find(filter)
    .select('name email designation phone avatar skills status role joinedAt lastLoginAt department')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, 'Employees fetched successfully', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      employees
    })
  );
});

// 5. GET /api/users/:id
// Returns specific employee detail - manager can view employees in managed departments
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id)
    .select('-password -otpHash -otpExpires')
    .populate('department', 'name code')
    .populate('approvedBy', 'name email');

  if (!employee) throw new ApiError(404, 'Employee not found');

  // Manager check - can only view employees in departments they manage
  if (req.user.role === USER_ROLES.MANAGER) {
    const managedDeptIds = await getManagedDepartmentIds(req.user._id);
    const ownDeptId = req.user.department?._id || req.user.department;
    if (ownDeptId) {
      const ownIdStr = ownDeptId.toString();
      const alreadyIncluded = managedDeptIds.some(id => id.toString() === ownIdStr);
      if (!alreadyIncluded) managedDeptIds.push(ownDeptId);
    }
    const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
    const isAuthorized = managedDeptIds.some(id => id.toString() === empDeptId);
    if (!isAuthorized) {
      throw new ApiError(403, 'You can only view profiles of employees in departments you manage');
    }
  }

  // Employee can only view their own profile
  if (req.user.role === USER_ROLES.EMPLOYEE && req.user._id.toString() !== employee._id.toString()) {
    throw new ApiError(403, 'You can only view your own profile');
  }

  res.status(200).json(
    new ApiResponse(200, 'Employee details retrieved', { employee })
  );
});

// 6. PATCH /api/users/profile
// Update current user profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, designation, phone, skills } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  if (name) user.name = name;
  if (designation !== undefined) user.designation = designation;
  if (phone !== undefined) user.phone = phone;
  if (skills) user.skills = skills;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        phone: user.phone,
        skills: user.skills,
        avatar: user.avatar
      }
    })
  );
});

// 7. PATCH /api/users/change-password
// Logged in user changes their password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Password changed successfully')
  );
});

// 8. PATCH /api/users/:id/suspend (Superadmin only)
// Suspend an employee or manager
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.role === USER_ROLES.SUPERADMIN) {
    throw new ApiError(403, 'Superadmin cannot be suspended');
  }

  user.status = USER_STATUS.SUSPENDED;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, `${user.name}'s account has been suspended`, {
      user: { _id: user._id, name: user.name, status: user.status }
    })
  );
});

module.exports = {
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  getEmployees,
  getEmployeeById,
  updateProfile,
  changePassword,
  suspendUser
};
