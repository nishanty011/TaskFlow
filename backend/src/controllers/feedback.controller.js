const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Feedback, Task, ActivityLog, Notification } = require('../models');
const { USER_ROLES, ACTIVITY_ACTIONS, ENTITY_TYPES, NOTIFICATION_TYPE } = require('../utils/constants');
const { emitToUser } = require('../config/socket');

// GET /api/feedbacks?taskId=... - Retrieve feedback for a task
const getFeedbacksByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query parameter is required');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view feedback for your own tasks');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view feedback for tasks in your department');
    }
  }

  const feedbacks = await Feedback.find({ task: taskId })
    .populate('author', 'name email avatar role')
    .populate('submission', 'version status')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Task feedback retrieved successfully', {
      count: feedbacks.length,
      feedbacks
    })
  );
});

// POST /api/feedbacks - Create feedback (Manager only)
const createFeedback = asyncHandler(async (req, res) => {
  const { taskId, submissionId, type, message, rating } = req.body;

  const task = await Task.findById(taskId).populate('assignedTo', 'name email _id');
  if (!task) throw new ApiError(404, 'Task not found');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'You can only submit feedback for tasks in your department');
  }

  const feedback = await Feedback.create({
    task: task._id,
    submission: submissionId || null,
    author: req.user._id,
    type: type || 'general',
    message,
    rating: rating || null
  });

  const notification = await Notification.create({
    user: task.assignedTo._id,
    type: NOTIFICATION_TYPE.COMMENT_ADDED,
    title: 'New Feedback Received',
    message: `${req.user.name} gave feedback on "${task.title}": "${message.substring(0, 50)}..."`,
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
    new ApiResponse(201, 'Feedback added successfully', { feedback: populated })
  );
});

// GET /api/feedbacks/:id - Retrieve specific feedback detail
const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('author', 'name email avatar role')
    .populate('task', 'title department assignedTo')
    .populate('submission', 'version status');

  if (!feedback) throw new ApiError(404, 'Feedback not found');

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (feedback.task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view your own task feedback');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (feedback.task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view feedback for your department');
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
