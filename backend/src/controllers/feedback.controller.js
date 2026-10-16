const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Feedback, Task, ActivityLog, Notification } = require('../models');
const { USER_ROLES, ACTIVITY_ACTIONS, ENTITY_TYPES, NOTIFICATION_TYPE } = require('../utils/constants');
const { emitToUser } = require('../config/socket');

// 1. GET /api/feedbacks?taskId=...
// Kisi task ke saare feedback fetch karein
const getFeedbacksByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query parameter zaroori hai');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Role check
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apne task ka feedback dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke task ka feedback dekh sakte hain');
    }
  }

  const feedbacks = await Feedback.find({ task: taskId })
    .populate('author', 'name email avatar role')
    .populate('submission', 'version status')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Task feedbacks fetch ho gaye', {
      count: feedbacks.length,
      feedbacks
    })
  );
});

// 2. POST /api/feedbacks (Manager only)
// Manager task ya submission par direct feedback de sake
const createFeedback = asyncHandler(async (req, res) => {
  const { taskId, submissionId, type, message, rating } = req.body;

  const task = await Task.findById(taskId).populate('assignedTo', 'name email _id');
  if (!task) throw new ApiError(404, 'Task nahi mila');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke tasks par feedback de sakte hain');
  }

  const feedback = await Feedback.create({
    task: task._id,
    submission: submissionId || null,
    author: req.user._id,
    type: type || 'general',
    message,
    rating: rating || null
  });

  // Employee ko notification bhejo
  const notification = await Notification.create({
    user: task.assignedTo._id,
    type: NOTIFICATION_TYPE.COMMENT_ADDED,
    title: 'Naya Feedback Mila!',
    message: `${req.user.name} ne aapke task "${task.title}" par feedback diya: "${message.substring(0, 50)}..."`,
    link: `/tasks/${task._id}`
  });

  emitToUser(task.assignedTo._id.toString(), 'notification', notification);

  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.FEEDBACK_GIVEN,
    entityType: ENTITY_TYPES.FEEDBACK,
    entityId: feedback._id,
    department: managerDeptId,
    meta: { taskTitle: task.title, type: feedback.type }
  });

  const populated = await Feedback.findById(feedback._id)
    .populate('author', 'name email avatar role');

  res.status(201).json(
    new ApiResponse(201, 'Feedback add ho gaya', { feedback: populated })
  );
});

// 3. GET /api/feedbacks/:id
// Specific feedback detail
const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('author', 'name email avatar role')
    .populate('task', 'title department assignedTo')
    .populate('submission', 'version status');

  if (!feedback) throw new ApiError(404, 'Feedback nahi mila');

  // Department check
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (feedback.task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apna feedback dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (feedback.task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ka feedback dekh sakte hain');
    }
  }

  res.status(200).json(
    new ApiResponse(200, 'Feedback detail', { feedback })
  );
});

module.exports = {
  getFeedbacksByTask,
  createFeedback,
  getFeedbackById
};
