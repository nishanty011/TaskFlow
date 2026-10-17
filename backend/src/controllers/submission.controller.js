const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Submission, Task, Feedback, ActivityLog } = require('../models');
const {
  USER_ROLES,
  TASK_STATUS,
  SUBMISSION_STATUS,
  FEEDBACK_TYPE,
  ACTIVITY_ACTIONS,
  ENTITY_TYPES
} = require('../utils/constants');
const {
  notifyTaskSubmitted,
  notifyTaskApproved,
  notifyChangesRequested
} = require('../services/notification.service');

// POST /api/submissions - Employee creates task submission deliverable
const createSubmission = asyncHandler(async (req, res) => {
  const { taskId, note, progressClaimed } = req.body;

  const task = await Task.findById(taskId).populate('assignedBy', 'name email _id');
  if (!task) throw new ApiError(404, 'Task not found');

  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only submit work for your assigned tasks');
  }

  if (task.status === TASK_STATUS.COMPLETED) {
    throw new ApiError(400, 'This task has already been completed');
  }

  const lastSubmission = await Submission.findOne({ task: task._id }).sort({ version: -1 });
  const nextVersion = lastSubmission ? lastSubmission.version + 1 : 1;

  const uploadedFiles = [];
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((file) => {
      uploadedFiles.push({
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        size: file.size,
        mime: file.mimetype
      });
    });
  }

  if (req.body.files) {
    let extraFiles = req.body.files;
    if (typeof extraFiles === 'string') {
      try {
        extraFiles = JSON.parse(extraFiles);
      } catch (e) {
        extraFiles = [];
      }
    }
    if (Array.isArray(extraFiles)) {
      uploadedFiles.push(...extraFiles);
    }
  }

  const submission = await Submission.create({
    task: task._id,
    employee: req.user._id,
    version: nextVersion,
    note: note || '',
    files: uploadedFiles,
    progressClaimed: progressClaimed !== undefined ? Number(progressClaimed) : task.progress,
    status: SUBMISSION_STATUS.PENDING
  });

  task.status = TASK_STATUS.UNDER_REVIEW;
  if (progressClaimed !== undefined) {
    task.progress = Math.min(100, Math.max(0, Number(progressClaimed)));
  }
  await task.save();

  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.SUBMISSION_CREATED,
    entityType: ENTITY_TYPES.SUBMISSION,
    entityId: submission._id,
    department: task.department,
    meta: { version: nextVersion, taskTitle: task.title }
  });

  const managerId = task.assignedBy?._id || task.assignedBy;
  await notifyTaskSubmitted(task, req.user, managerId);

  const populated = await Submission.findById(submission._id)
    .populate('employee', 'name email avatar')
    .populate('task', 'title status dueDate');

  res.status(201).json(
    new ApiResponse(201, `Deliverable v${nextVersion} submitted successfully`, { submission: populated })
  );
});

// GET /api/submissions?taskId=... - Task submissions with version history
const getTaskSubmissions = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query parameter is required');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view submissions for your own tasks');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view submissions for tasks in your department');
    }
  }

  const submissions = await Submission.find({ task: taskId })
    .populate('employee', 'name email avatar')
    .populate('reviewedBy', 'name email avatar')
    .sort({ version: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Task submissions retrieved successfully', {
      count: submissions.length,
      submissions
    })
  );
});

// GET /api/submissions/:id - Specific submission detail with feedback
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('task', 'title description status department assignedTo assignedBy')
    .populate('employee', 'name email avatar')
    .populate('reviewedBy', 'name email avatar');

  if (!submission) throw new ApiError(404, 'Submission not found');

  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (submission.employee._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You can only view your own submissions');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (submission.task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'You can only view submissions in your department');
    }
  }

  const feedbacks = await Feedback.find({ submission: submission._id })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Submission detail', { submission, feedbacks })
  );
});

// PATCH /api/submissions/:id/review - Manager reviews submission
const reviewSubmission = asyncHandler(async (req, res) => {
  const { status, feedback, rating } = req.body;

  const submission = await Submission.findById(req.params.id).populate('task');
  if (!submission) throw new ApiError(404, 'Submission not found');

  const task = await Task.findById(submission.task._id).populate('assignedTo', 'name email _id');
  if (!task) throw new ApiError(404, 'Task not found');

  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'You can only review submissions for your department');
  }

  submission.status = status;
  submission.reviewedBy = req.user._id;
  submission.reviewedAt = new Date();
  await submission.save();

  const feedbackDoc = await Feedback.create({
    task: task._id,
    submission: submission._id,
    author: req.user._id,
    type: status === 'approved' ? FEEDBACK_TYPE.APPROVAL : FEEDBACK_TYPE.CHANGE_REQUEST,
    message: feedback,
    rating: rating || null
  });

  if (status === 'approved') {
    task.status = TASK_STATUS.COMPLETED;
    task.progress = 100;
    task.completedAt = new Date();

    await notifyTaskApproved(task, task.assignedTo, req.user);

    await ActivityLog.create({
      actor: req.user._id,
      action: ACTIVITY_ACTIONS.TASK_APPROVED,
      entityType: ENTITY_TYPES.TASK,
      entityId: task._id,
      department: managerDeptId,
      meta: { submissionVersion: submission.version }
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
      meta: { submissionVersion: submission.version, feedback }
    });
  }

  await task.save();

  res.status(200).json(
    new ApiResponse(200, status === 'approved' ? 'Deliverable approved successfully!' : 'Changes requested successfully', {
      submission,
      feedback: feedbackDoc,
      taskStatus: task.status
    })
  );
});

// GET /api/submissions/pending - Pending submissions for department manager / superadmin
const getPendingSubmissions = asyncHandler(async (req, res) => {
  const managerDeptId = req.user.department?._id || req.user.department;
  const filter = req.user.role === USER_ROLES.SUPERADMIN
    ? { isArchived: false }
    : { department: managerDeptId, isArchived: false };

  const deptTasks = await Task.find(filter).select('_id');
  const taskIds = deptTasks.map((t) => t._id);

  const pendingSubmissions = await Submission.find({
    task: { $in: taskIds },
    status: 'pending'
  })
    .populate('employee', 'name email avatar designation')
    .populate({
      path: 'task',
      select: 'title priority dueDate progress department checklist tags',
      populate: { path: 'assignedTo', select: 'name email avatar' }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Pending submissions retrieved successfully', {
      count: pendingSubmissions.length,
      submissions: pendingSubmissions
    })
  );
});

// GET /api/submissions/my - Submissions by current logged-in employee
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ employee: req.user._id })
    .populate('task', 'title priority dueDate status progress')
    .populate('reviewedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Submissions retrieved successfully', {
      count: submissions.length,
      submissions
    })
  );
});

module.exports = {
  createSubmission,
  getTaskSubmissions,
  getSubmissionById,
  reviewSubmission,
  getPendingSubmissions,
  getMySubmissions
};
