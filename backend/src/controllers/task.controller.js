const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Task, User, Comment, ActivityLog, Department, Submission, Feedback } = require('../models');
const { USER_ROLES, TASK_STATUS, ENTITY_TYPES, ACTIVITY_ACTIONS } = require('../utils/constants');
const {
  notifyTaskAssigned,
  notifyTaskSubmitted,
  notifyTaskApproved,
  notifyChangesRequested,
  notifyComment
} = require('../services/notification.service');

// Calculate weighted checklist progress
const calculateProgress = (checklist) => {
  if (!checklist || checklist.length === 0) return 0;
  const totalWeight = checklist.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checklist
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);
  return Math.round((completedWeight / totalWeight) * 100);
};

// 1. GET /api/tasks
// Manager sees department tasks, employee sees assigned tasks
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 20, overdue } = req.query;

  const filter = { isArchived: false };

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    // Scope to assigned employee tasks
    filter.assignedTo = req.user._id;
  } else if (req.user.role === USER_ROLES.MANAGER) {
    // Scope to manager department tasks
    filter.department = req.user.department?._id || req.user.department;
  }
  

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Filter overdue tasks
  if (overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $nin: [TASK_STATUS.COMPLETED] };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Task.countDocuments(filter);

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email avatar designation')
    .populate('assignedBy', 'name email avatar')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json(
    new ApiResponse(200, 'Tasks fetched successfully', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      tasks
    })
  );
});

// 2. GET /api/tasks/:id
// Get full task details
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar designation department')
    .populate('assignedBy', 'name email avatar')
    .populate('department', 'name code');

  if (!task) throw new ApiError(404, 'Task not found');

  // Verify task access permissions
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view your own assigned tasks');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department._id.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view tasks within your department');
    }
  }

  // Include task comments
  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name email avatar role')
    .populate('mentions', 'name email')
    .sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(200, 'Task detail', { task, comments })
  );
});

// 3. POST /api/tasks (Manager only)
// Create new task and assign to employee
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, dueDate, startDate, estimatedHours, tags, attachments, checklist } = req.body;

  const managerDeptId = req.user.department?._id || req.user.department;

  // Validate employee existence and department
  const employee = await User.findById(assignedTo).populate('department');
  if (!employee) throw new ApiError(404, 'Employee not found');

  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
  if (managerDeptId?.toString() !== empDeptId) {
    throw new ApiError(403, 'You can only assign tasks to employees in your department');
  }

  if (employee.role !== USER_ROLES.EMPLOYEE) {
    throw new ApiError(400, 'Tasks can only be assigned to employees');
  }

  const parsedChecklist = (checklist || []).map((item) => ({
    title: item.title,
    weight: item.weight || 1,
    done: false
  }));

  const task = await Task.create({
    title,
    description: description || '',
    department: managerDeptId,
    assignedBy: req.user._id,
    assignedTo: employee._id,
    priority: priority || 'medium',
    dueDate: new Date(dueDate),
    startDate: startDate ? new Date(startDate) : new Date(),
    estimatedHours: estimatedHours || 0,
    tags: tags || [],
    attachments: attachments || [],
    checklist: parsedChecklist,
    progress: 0
  });

  // Record activity log and dispatch notification
  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.TASK_CREATED,
    entityType: ENTITY_TYPES.TASK,
    entityId: task._id,
    department: managerDeptId,
    meta: { taskTitle: task.title, assignedTo: employee.name }
  });

  await notifyTaskAssigned(task, employee, req.user);

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('assignedBy', 'name email');

  res.status(201).json(
    new ApiResponse(201, 'Task created and assigned successfully', { task: populated })
  );
});

// 4. PATCH /api/tasks/:id (Manager only)
// Update task details
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'You can only update tasks in your department');
  }

  
  if (task.status === TASK_STATUS.COMPLETED) {
    throw new ApiError(400, 'Completed tasks cannot be updated');
  }

  const { title, description, priority, dueDate, startDate, estimatedHours, tags, attachments } = req.body;

  if (title) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority) task.priority = priority;
  if (dueDate) task.dueDate = new Date(dueDate);
  if (startDate) task.startDate = new Date(startDate);
  if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
  if (tags) task.tags = tags;
  if (attachments) task.attachments = attachments;

  await task.save();

  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.TASK_UPDATED,
    entityType: ENTITY_TYPES.TASK,
    entityId: task._id,
    department: managerDeptId,
    meta: { taskTitle: task.title }
  });

  res.status(200).json(
    new ApiResponse(200, 'Task updated successfully', { task })
  );
});

// 5. PATCH /api/tasks/:id/status (Employee only)
// Employee marks task in_progress or submitted
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id)
    .populate('assignedBy', 'name email _id department');

  if (!task) throw new ApiError(404, 'Task not found');

  // Only assigned employee can update their task
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update the status of tasks assigned to you');
  }

  // Status transition rules
  const allowedTransitions = {
    [TASK_STATUS.ASSIGNED]: [TASK_STATUS.IN_PROGRESS],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.SUBMITTED],
    [TASK_STATUS.CHANGES_REQUESTED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.SUBMITTED]
  };

  const allowed = allowedTransitions[task.status];
  if (!allowed || !allowed.includes(status)) {
    throw new ApiError(400, `Task cannot transition from '${task.status}' to '${status}'. Valid transitions: ${allowed?.join(', ') || 'none'}`);
  }

  task.status = status;

  // If submitted, mark under_review
  if (status === TASK_STATUS.SUBMITTED) {
    task.status = TASK_STATUS.UNDER_REVIEW;

    // Notify manager
    const managerId = task.assignedBy._id || task.assignedBy;
    await notifyTaskSubmitted(task, req.user, managerId);

    await ActivityLog.create({
      actor: req.user._id,
      action: ACTIVITY_ACTIONS.TASK_SUBMITTED,
      entityType: ENTITY_TYPES.TASK,
      entityId: task._id,
      department: task.department
    });
  }

  await task.save();

  res.status(200).json(
    new ApiResponse(200, `Task status changed to '${task.status}'`, { task })
  );
});

// 6. PATCH /api/tasks/:id/checklist (Employee only)
// Toggle checklist item and auto-calculate progress
const updateChecklist = asyncHandler(async (req, res) => {
  const { itemId, done } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only update your own task checklist');
  }

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.UNDER_REVIEW].includes(task.status)) {
    throw new ApiError(400, 'Checklist cannot be updated in current task status');
  }

  // Find checklist item
  const item = task.checklist.id(itemId);
  if (!item) throw new ApiError(404, 'Checklist item not found');

  item.done = done;

  // Recalculate progress
  task.progress = calculateProgress(task.checklist);

  await task.save();

  res.status(200).json(
    new ApiResponse(200, 'Checklist updated successfully', {
      checklist: task.checklist,
      progress: task.progress
    })
  );
});

// 7. PATCH /api/tasks/:id/review (Manager only)
// Manager reviews submitted task
const reviewTask = asyncHandler(async (req, res) => {
  const { action, feedback } = req.body;

  if (!['approve', 'request_changes'].includes(action)) {
    throw new ApiError(400, "Action must be either 'approve' or 'request_changes'");
  }

  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email _id');

  if (!task) throw new ApiError(404, 'Task not found');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'You can only review tasks in your department');
  }

  if (task.status !== TASK_STATUS.UNDER_REVIEW) {
    throw new ApiError(400, 'Only tasks under review can be reviewed');
  }

  if (action === 'approve') {
    task.status = TASK_STATUS.COMPLETED;
    task.progress = 100;
    task.completedAt = new Date();

    await notifyTaskApproved(task, task.assignedTo, req.user);

    await ActivityLog.create({
      actor: req.user._id,
      action: ACTIVITY_ACTIONS.TASK_APPROVED,
      entityType: ENTITY_TYPES.TASK,
      entityId: task._id,
      department: managerDeptId
    });
  } else {
    task.status = TASK_STATUS.CHANGES_REQUESTED;

    await notifyChangesRequested(task, task.assignedTo, req.user);

    await ActivityLog.create({
      actor: req.user._id,
      action: ACTIVITY_ACTIONS.TASK_CHANGES_REQUESTED,
      entityType: ENTITY_TYPES.TASK,
      entityId: task._id,
      department: managerDeptId,
      meta: { feedback }
    });
  }

  await task.save();

  res.status(200).json(
    new ApiResponse(200, action === 'approve' ? 'Task approved successfully!' : 'Changes requested successfully', {
      task
    })
  );
});

// 8. POST /api/tasks/:id/comments
// Add comment to task
const addComment = asyncHandler(async (req, res) => {
  const message = (req.body.message || req.body.content || '').trim();
  const { mentions = [] } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  // Access check
  if (req.user.role === USER_ROLES.EMPLOYEE && task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only comment on tasks assigned to you');
  }
  if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only comment on tasks within your department');
    }
  }

  const comment = await Comment.create({
    task: task._id,
    author: req.user._id,
    message,
    mentions
  });

  const populated = await Comment.findById(comment._id)
    .populate('author', 'name email avatar role')
    .populate('mentions', 'name email');

  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.COMMENT_ADDED,
    entityType: ENTITY_TYPES.COMMENT,
    entityId: comment._id,
    department: task.department
  });

  // Notify mentioned users
  if (mentions.length > 0) {
    await notifyComment(task, comment, req.user, mentions);
  }

  res.status(201).json(
    new ApiResponse(201, 'Comment added successfully', { comment: populated })
  );
});

// 9. DELETE /api/tasks/:id (Manager only)
// Soft-delete/archive task
const archiveTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'You can only archive tasks within your department');
  }

  task.isArchived = true;
  await task.save();

  res.status(200).json(
    new ApiResponse(200, 'Task archived successfully', { taskId: task._id })
  );
});

// 10. GET /api/tasks/stats
// Aggregate task statistics
const getTaskStats = asyncHandler(async (req, res) => {
  const isEmployee = req.user.role === USER_ROLES.EMPLOYEE;
  const matchFilter = isEmployee
    ? { assignedTo: req.user._id, isArchived: false }
    : {
        department: req.user.department?._id || req.user.department,
        isArchived: false
      };

  const statusCounts = await Task.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Overdue count
  const overdueCount = await Task.countDocuments({
    ...matchFilter,
    dueDate: { $lt: new Date() },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Aaj due tasks
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const dueTodayCount = await Task.countDocuments({
    ...matchFilter,
    dueDate: { $gte: todayStart, $lte: todayEnd },
    status: { $nin: [TASK_STATUS.COMPLETED] }
  });

  // Convert status counts to key-value map
  const stats = statusCounts.reduce((acc, s) => {
    acc[s._id] = s.count;
    return acc;
  }, {});

  res.status(200).json(
    new ApiResponse(200, 'Task stats', {
      stats,
      overdueCount,
      dueTodayCount
    })
  );
});

// 11. GET /api/tasks/:id/timeline
// Ordered events for progress tracker (assigned -> in_progress -> submissions -> feedbacks -> completed)
const getTaskTimeline = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar designation')
    .populate('assignedBy', 'name email avatar');

  if (!task) throw new ApiError(404, 'Task not found');

  // Access check
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view the timeline for your assigned tasks');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view timelines for tasks in your department');
    }
  }

  const events = [];

  // 1. Task Assigned
  events.push({
    type: 'assigned',
    title: 'Task Assigned',
    timestamp: task.createdAt,
    actor: task.assignedBy,
    meta: { priority: task.priority, dueDate: task.dueDate }
  });

  // 2. Submissions
  const submissions = await Submission.find({ task: task._id })
    .populate('employee', 'name email avatar')
    .sort({ createdAt: 1 });

  submissions.forEach((sub) => {
    events.push({
      type: 'submitted',
      title: `Submission v${sub.version}`,
      timestamp: sub.createdAt,
      actor: sub.employee,
      meta: {
        version: sub.version,
        note: sub.note,
        progressClaimed: sub.progressClaimed,
        filesCount: sub.files?.length || 0,
        status: sub.status
      }
    });
  });

  // 3. Feedbacks
  const feedbacks = await Feedback.find({ task: task._id })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: 1 });

  feedbacks.forEach((fb) => {
    events.push({
      type: fb.type === 'approval' ? 'approved' : fb.type === 'change_request' ? 'changes_requested' : 'feedback',
      title: fb.type === 'approval' ? 'Submission Approved' : fb.type === 'change_request' ? 'Changes Requested' : 'Feedback Given',
      timestamp: fb.createdAt,
      actor: fb.author,
      meta: {
        message: fb.message,
        rating: fb.rating
      }
    });
  });

  // 4. Completed Event if task is completed
  if (task.completedAt) {
    events.push({
      type: 'completed',
      title: 'Task Completed',
      timestamp: task.completedAt,
      actor: task.assignedBy,
      meta: { progress: 100 }
    });
  }

  // Chronological order
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.status(200).json(
    new ApiResponse(200, 'Task timeline events', {
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        progress: task.progress,
        dueDate: task.dueDate
      },
      timeline: events
    })
  );
});

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  updateChecklist,
  reviewTask,
  addComment,
  archiveTask,
  getTaskStats,
  getTaskTimeline
};
