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

// Checklist se progress calculate karo (weighted average)
const calculateProgress = (checklist) => {
  if (!checklist || checklist.length === 0) return 0;
  const totalWeight = checklist.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checklist
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);
  return Math.round((completedWeight / totalWeight) * 100);
};

// 1. GET /api/tasks
// Manager apne dept ke saare tasks dekhe, employee sirf apne assigned tasks
const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, search, page = 1, limit = 20, overdue } = req.query;

  const filter = { isArchived: false };

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    // Employee sirf apne tasks
    filter.assignedTo = req.user._id;
  } else if (req.user.role === USER_ROLES.MANAGER) {
    // Manager apne department ke tasks
    filter.department = req.user.department?._id || req.user.department;
  }
  // Superadmin ko koi department filter nahi

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Sirf overdue tasks
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
    new ApiResponse(200, 'Tasks fetch ho gaye', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      tasks
    })
  );
});

// 2. GET /api/tasks/:id
// Specific task ki full detail
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar designation department')
    .populate('assignedBy', 'name email avatar')
    .populate('department', 'name code');

  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Access check - employee sirf apna task dekhe, manager sirf apne dept ka
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apne assigned tasks dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department._id.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke tasks dekh sakte hain');
    }
  }

  // Comments bhi saath mein bhejo
  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name email avatar role')
    .populate('mentions', 'name email')
    .sort({ createdAt: 1 });

  res.status(200).json(
    new ApiResponse(200, 'Task detail', { task, comments })
  );
});

// 3. POST /api/tasks (Manager only)
// Naya task create karo aur employee ko assign karo
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, priority, dueDate, startDate, estimatedHours, tags, attachments, checklist } = req.body;

  const managerDeptId = req.user.department?._id || req.user.department;

  // Employee exist karta hai aur is department ka hai ye check karo
  const employee = await User.findById(assignedTo).populate('department');
  if (!employee) throw new ApiError(404, 'Employee nahi mila');

  const empDeptId = employee.department?._id?.toString() || employee.department?.toString();
  if (managerDeptId?.toString() !== empDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke employees ko task assign kar sakte hain');
  }

  if (employee.role !== USER_ROLES.EMPLOYEE) {
    throw new ApiError(400, 'Sirf employees ko task assign kiya ja sakta hai');
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

  // Activity log aur employee notification
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
    new ApiResponse(201, 'Task create aur assign ho gaya', { task: populated })
  );
});

// 4. PATCH /api/tasks/:id (Manager only)
// Task ki details update karo (title, description, priority, dueDate, etc.)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke tasks update kar sakte hain');
  }

  // Completed task ko update nahi kar sakte
  if (task.status === TASK_STATUS.COMPLETED) {
    throw new ApiError(400, 'Completed task ko update nahi kiya ja sakta');
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
    new ApiResponse(200, 'Task update ho gaya', { task })
  );
});

// 5. PATCH /api/tasks/:id/status (Employee only)
// Employee task ko in_progress ya submitted mark kare
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id)
    .populate('assignedBy', 'name email _id department');

  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Sirf assigned employee apna task update kar sake
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Aap sirf apne assigned task ka status update kar sakte hain');
  }

  // Status transition rules - kya se kya ja sakte hain
  const allowedTransitions = {
    [TASK_STATUS.ASSIGNED]: [TASK_STATUS.IN_PROGRESS],
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.SUBMITTED],
    [TASK_STATUS.CHANGES_REQUESTED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.SUBMITTED]
  };

  const allowed = allowedTransitions[task.status];
  if (!allowed || !allowed.includes(status)) {
    throw new ApiError(400, `Task '${task.status}' se '${status}' nahi ho sakta. Valid transitions: ${allowed?.join(', ') || 'none'}`);
  }

  task.status = status;

  // Submitted kiya toh under_review mark karo
  if (status === TASK_STATUS.SUBMITTED) {
    task.status = TASK_STATUS.UNDER_REVIEW;

    // Manager ko notification bhejo
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
    new ApiResponse(200, `Task status '${task.status}' ho gaya`, { task })
  );
});

// 6. PATCH /api/tasks/:id/checklist (Employee only)
// Checklist item done/undone mark karo aur progress auto-calculate karo
const updateChecklist = asyncHandler(async (req, res) => {
  const { itemId, done } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Aap sirf apne task ki checklist update kar sakte hain');
  }

  if ([TASK_STATUS.COMPLETED, TASK_STATUS.UNDER_REVIEW].includes(task.status)) {
    throw new ApiError(400, 'Is status mein checklist update nahi ho sakti');
  }

  // Checklist item dhundho
  const item = task.checklist.id(itemId);
  if (!item) throw new ApiError(404, 'Checklist item nahi mila');

  item.done = done;

  // Weighted progress recalculate karo
  task.progress = calculateProgress(task.checklist);

  await task.save();

  res.status(200).json(
    new ApiResponse(200, 'Checklist update ho gaya', {
      checklist: task.checklist,
      progress: task.progress
    })
  );
});

// 7. PATCH /api/tasks/:id/review (Manager only)
// Manager submitted task ko approve ya changes request kare
const reviewTask = asyncHandler(async (req, res) => {
  const { action, feedback } = req.body;

  if (!['approve', 'request_changes'].includes(action)) {
    throw new ApiError(400, "Action 'approve' ya 'request_changes' hona chahiye");
  }

  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email _id');

  if (!task) throw new ApiError(404, 'Task nahi mila');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke tasks review kar sakte hain');
  }

  if (task.status !== TASK_STATUS.UNDER_REVIEW) {
    throw new ApiError(400, 'Sirf under_review status ke tasks ka review ho sakta hai');
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
    new ApiResponse(200, action === 'approve' ? 'Task approve ho gaya!' : 'Changes request bhej di gayi', {
      task
    })
  );
});

// 8. POST /api/tasks/:id/comments
// Task par comment add karo (manager ya employee dono kar sakte hain)
const addComment = asyncHandler(async (req, res) => {
  const message = (req.body.message || req.body.content || '').trim();
  const { mentions = [] } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Access check
  if (req.user.role === USER_ROLES.EMPLOYEE && task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Aap sirf apne assigned task par comment kar sakte hain');
  }
  if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke tasks par comment kar sakte hain');
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

  // Mentioned users ko notify karo
  if (mentions.length > 0) {
    await notifyComment(task, comment, req.user, mentions);
  }

  res.status(201).json(
    new ApiResponse(201, 'Comment add ho gaya', { comment: populated })
  );
});

// 9. DELETE /api/tasks/:id (Manager only)
// Task archive karo (soft delete)
const archiveTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke tasks archive kar sakte hain');
  }

  task.isArchived = true;
  await task.save();

  res.status(200).json(
    new ApiResponse(200, 'Task archive ho gaya', { taskId: task._id })
  );
});

// 10. GET /api/tasks/stats
// Dashboard ke liye stats - manager ke liye dept overview, employee ke liye apna summary
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

  // Status ko object format mein convert karo
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

  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Access check
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apne task ka timeline dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke task ka timeline dekh sakte hain');
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
