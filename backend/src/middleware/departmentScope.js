const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { USER_ROLES } = require('../utils/constants');

// Department scope helper middleware
// Har query par automatic department filter lagata hai taaki data leak na ho
const departmentScope = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication zaroori hai'));
  }

  const userRole = req.user.role;
  const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();

  // Super Admin ke liye koi department restriction nahi hai
  if (userRole === USER_ROLES.SUPERADMIN) {
    req.deptFilter = {};
    return next();
  }

  // Manager ya Employee ke paas department hona mandatory hai
  if (!userDeptId) {
    return next(new ApiError(403, 'Aap kisi bhi department se linked nahi hain'));
  }

  // Agar request ke query ya body me alag department bheja gaya ho toh cross-department block karein
  const requestedDept = req.query?.department || req.body?.department;
  if (requestedDept && requestedDept.toString() !== userDeptId) {
    return next(
      new ApiError(
        403,
        'Cross-department access strictly prohibited: Aap dusre department ka data access nahi kar sakte'
      )
    );
  }

  // Manager ke liye: Sirf unka apna department
  if (userRole === USER_ROLES.MANAGER) {
    req.deptFilter = { department: userDeptId };
    return next();
  }

  // Employee ke liye: Apna department aur sirf unke assigned tasks
  if (userRole === USER_ROLES.EMPLOYEE) {
    req.deptFilter = {
      department: userDeptId,
      assignedTo: req.user._id
    };
    return next();
  }

  next();
};

// Resource ownership aur department verification middleware
// Parameter ID se document fetch karta hai aur verify karta hai ki caller ke department ka hai ya nahi
const verifyDepartmentAccess = (Model, paramKey = 'id') => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[paramKey];

    if (!resourceId) {
      return next(new ApiError(400, `Missing route parameter: ${paramKey}`));
    }

    const doc = await Model.findById(resourceId);
    if (!doc) {
      return next(new ApiError(404, 'Requested record nahi mila'));
    }

    // Super Admin ko full access hai
    if (req.user.role === USER_ROLES.SUPERADMIN) {
      req.scopedDoc = doc;
      return next();
    }

    const userDeptId = req.user.department?._id?.toString() || req.user.department?.toString();

    // Document ka department ID nikalein (chahe direct field ho ya user document ho)
    const docDeptId = doc.department
      ? (doc.department._id?.toString() || doc.department.toString())
      : null;

    // 1. Manager check: Kya document manager ke apne department ka hai?
    if (req.user.role === USER_ROLES.MANAGER) {
      if (!docDeptId || docDeptId !== userDeptId) {
        return next(
          new ApiError(
            403,
            'Forbidden: Aap sirf apne department ke records access kar sakte hain'
          )
        );
      }
    }

    // 2. Employee check: Kya document employee ka apna hai?
    if (req.user.role === USER_ROLES.EMPLOYEE) {
      const isAssigned = doc.assignedTo && doc.assignedTo.toString() === req.user._id.toString();
      const isSelf = doc._id.toString() === req.user._id.toString();
      const isOwnSubmission = doc.employee && doc.employee.toString() === req.user._id.toString();

      if (!isAssigned && !isSelf && !isOwnSubmission) {
        return next(
          new ApiError(
            403,
            'Forbidden: Aap sirf apne assigned tasks ya records access kar sakte hain'
          )
        );
      }
    }

    // Verified document ko request me attach karein taaki controller ko dubara query na karni pade
    req.scopedDoc = doc;
    next();
  });
};

module.exports = {
  departmentScope,
  verifyDepartmentAccess
};
