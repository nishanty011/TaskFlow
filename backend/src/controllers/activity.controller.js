const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { ActivityLog } = require('../models');
const { USER_ROLES } = require('../utils/constants');

// 1. GET /api/activities
// Audit trail timeline - manager apne department ka dekhe, superadmin sab dekhe
const getActivities = asyncHandler(async (req, res) => {
  const { entityType, action, departmentId, page = 1, limit = 25 } = req.query;

  const filter = {};

  // Role ke hisaab se department data isolation
  if (req.user.role === USER_ROLES.MANAGER) {
    filter.department = req.user.department?._id || req.user.department;
  } else if (req.user.role === USER_ROLES.EMPLOYEE) {
    filter.actor = req.user._id;
  } else if (req.user.role === USER_ROLES.SUPERADMIN && departmentId) {
    filter.department = departmentId;
  }

  if (entityType) filter.entityType = entityType;
  if (action) filter.action = action;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await ActivityLog.countDocuments(filter);

  const activities = await ActivityLog.find(filter)
    .populate('actor', 'name email avatar role')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, 'Activities fetch ho gayi', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      activities
    })
  );
});

// 2. GET /api/activities/stats
// Activity summary by action (manager/superadmin only)
const getActivityStats = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === USER_ROLES.MANAGER) {
    filter.department = req.user.department?._id || req.user.department;
  }

  const actionStats = await ActivityLog.aggregate([
    { $match: filter },
    { $group: { _id: '$action', count: { $sum: 1 } } }
  ]);

  const stats = actionStats.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.status(200).json(
    new ApiResponse(200, 'Activity stats', { stats })
  );
});

module.exports = {
  getActivities,
  getActivityStats
};
