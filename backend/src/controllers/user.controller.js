const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { User, Notification, ActivityLog } = require('../models');
const { USER_ROLES, USER_STATUS, NOTIFICATION_TYPE, ACTIVITY_ACTIONS, ENTITY_TYPES } = require('../utils/constants');
const { emitToUser } = require('../config/socket');

// 1. GET /api/users/pending
// Manager ke liye - unke department ke pending approval employees
const getPendingEmployees = asyncHandler(async (req, res) => {
  const deptId = req.user.department?._id || req.user.department;

  const pendingUsers = await User.find({
    department: deptId,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.PENDING_APPROVAL
  })
    .select('name email designation phone skills createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Pending approval employees', {
      count: pendingUsers.length,
      employees: pendingUsers
    })
  );
});

// 2. PATCH /api/users/:id/approve
// Manager apne department ke pending employee ko approve kare
const approveEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id).populate('department');

  if (!employee) throw new ApiError(404, 'Employee nahi mila');

  // Sirf apne department ka employee approve kar sakte hain
  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();

  if (managerDeptId !== empDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke employee ko approve kar sakte hain');
  }

  if (employee.status !== USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(400, `Employee ka status already '${employee.status}' hai`);
  }

  // Status active kar do
  employee.status = USER_STATUS.ACTIVE;
  employee.approvedBy = req.user._id;
  employee.approvedAt = new Date();
  await employee.save();

  // Notify employee - account approved
  const notification = await Notification.create({
    user: employee._id,
    type: NOTIFICATION_TYPE.EMPLOYEE_APPROVED,
    title: 'Account Approved!',
    message: `${req.user.name} approved your account. You can now access TaskFlow!`,
    link: '/dashboard'
  });

  emitToUser(employee._id.toString(), 'notification', notification);

  // Activity log record
  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.USER_APPROVED,
    entityType: ENTITY_TYPES.USER,
    entityId: employee._id,
    department: managerDeptId,
    meta: { employeeEmail: employee.email }
  });

  res.status(200).json(
    new ApiResponse(200, `${employee.name}'s account has been approved`, {
      employee: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        status: employee.status,
        approvedAt: employee.approvedAt
      }
    })
  );
});

// 3. PATCH /api/users/:id/reject
// Manager rejects pending employee in their department
const rejectEmployee = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const employee = await User.findById(req.params.id).populate('department');

  if (!employee) throw new ApiError(404, 'Employee nahi mila');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();

  if (managerDeptId !== empDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke employee ko reject kar sakte hain');
  }

  if (employee.status !== USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(400, `Employee ka status already '${employee.status}' hai`);
  }

  employee.status = USER_STATUS.REJECTED;
  await employee.save();

  // Notify employee of rejection
  const notification = await Notification.create({
    user: employee._id,
    type: NOTIFICATION_TYPE.EMPLOYEE_REJECTED,
    title: 'Registration Request Rejected',
    message: `Your registration request was rejected. Reason: ${reason}`,
    link: '/contact'
  });

  emitToUser(employee._id.toString(), 'notification', notification);

  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.USER_REJECTED,
    entityType: ENTITY_TYPES.USER,
    entityId: employee._id,
    department: managerDeptId,
    meta: { reason, employeeEmail: employee.email }
  });

  res.status(200).json(
    new ApiResponse(200, `${employee.name} ki request reject kar di gayi`, {
      employee: { _id: employee._id, name: employee.name, status: employee.status }
    })
  );
});

// 4. GET /api/users
// Manager ke liye department ke saare active employees, superadmin ke liye sab
const getEmployees = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  // Base filter - superadmin ko sab, manager & employee ko sirf apna department
  const filter = {};

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    filter.department = req.user.department?._id || req.user.department;
    filter.status = USER_STATUS.ACTIVE;
  } else if (req.user.role === USER_ROLES.MANAGER) {
    filter.department = req.user.department?._id || req.user.department;
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
    new ApiResponse(200, 'Employees fetch ho gaye', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      employees
    })
  );
});

// 5. GET /api/users/:id
// Specific employee ki detail - manager sirf apne dept ka dekh sake
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id)
    .select('-password -otpHash -otpExpires')
    .populate('department', 'name code')
    .populate('approvedBy', 'name email');

  if (!employee) throw new ApiError(404, 'Employee nahi mila');

  // Manager check - cross department access block
  if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
    if (managerDeptId !== empDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke employee ka profile dekh sakte hain');
    }
  }

  // Employee sirf apna profile dekh sakta hai
  if (req.user.role === USER_ROLES.EMPLOYEE && req.user._id.toString() !== employee._id.toString()) {
    throw new ApiError(403, 'Aap sirf apna profile dekh sakte hain');
  }

  res.status(200).json(
    new ApiResponse(200, 'Employee detail', { employee })
  );
});

// 6. PATCH /api/users/profile
// Logged in user apna profile update kare
const updateProfile = asyncHandler(async (req, res) => {
  const { name, designation, phone, skills } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User nahi mila');

  if (name) user.name = name;
  if (designation !== undefined) user.designation = designation;
  if (phone !== undefined) user.phone = phone;
  if (skills) user.skills = skills;

  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Profile update ho gaya', {
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
// Logged in user apna password change kare
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User nahi mila');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password galat hai');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Password successfully change ho gaya')
  );
});

// 8. PATCH /api/users/:id/suspend (Superadmin only)
// Employee ya manager ko suspend karein
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User nahi mila');

  if (user.role === USER_ROLES.SUPERADMIN) {
    throw new ApiError(403, 'Super Admin ko suspend nahi kiya ja sakta');
  }

  user.status = USER_STATUS.SUSPENDED;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, `${user.name} ka account suspend kar diya gaya`, {
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
