const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../utils/constants');

// Scopes queries to enforce department data isolation
const departmentScope = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const userRole = req.user.role;
  const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();

  if (userRole === USER_ROLES.SUPERADMIN) {
    req.deptFilter = {};
    return next();
  }

  if (!userDeptId) {
    return next(new ApiError(403, 'You are not assigned to any department'));
  }

  const requestedDept = req.query?.department || req.body?.department;
  if (requestedDept && requestedDept.toString() !== userDeptId) {
    return next(
      new ApiError(
        403,
        'Cross-department access is strictly prohibited'
      )
    );
  }

  if (userRole === USER_ROLES.MANAGER) {
    req.deptFilter = { department: userDeptId };
    return next();
  }

  if (userRole === USER_ROLES.EMPLOYEE) {
    req.deptFilter = {
      department: userDeptId,
      assignedTo: req.user._id
    };
    return next();
  }

  next();
};

// Verifies document ownership and department authorization
const verifyDepartmentAccess = (Model, paramKey = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramKey];

    if (!resourceId) {
      return next(new ApiError(400, `Missing route parameter: ${paramKey}`));
    }

    const doc = await Model.findById(resourceId);
    if (!doc) {
      return next(new ApiError(404, 'Requested record not found'));
    }

    if (req.user.role === USER_ROLES.SUPERADMIN) {
      req.scopedDoc = doc;
      return next();
    }

    const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    const docDeptId = doc.department
      ? (doc.department._id?.toString() || doc.department.toString())
      : null;

    if (req.user.role === USER_ROLES.MANAGER) {
      if (!docDeptId || docDeptId !== userDeptId) {
        return next(
          new ApiError(
            403,
            'Forbidden: You can only access records from your own department'
          )
        );
      }
    }

    if (req.user.role === USER_ROLES.EMPLOYEE) {
      const isAssigned = doc.assignedTo && doc.assignedTo.toString() === req.user._id.toString();
      const isSelf = doc._id.toString() === req.user._id.toString();
      const isOwnSubmission = doc.employee && doc.employee.toString() === req.user._id.toString();

      if (!isAssigned && !isSelf && !isOwnSubmission) {
        return next(
          new ApiError(
            403,
            'Forbidden: You can only access your own assigned tasks or records'
          )
        );
      }
    }

    req.scopedDoc = doc;
    next();
  });
};

module.exports = {
  departmentScope,
  verifyDepartmentAccess
};
