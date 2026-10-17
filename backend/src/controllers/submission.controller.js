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

// 1. POST /api/submissions
// Employee task submission create kare (versioned document upload)
const createSubmission = asyncHandler(async (req, res) => {
  const { taskId, note, progressClaimed } = req.body;

  const task = await Task.findById(taskId).populate('assignedBy', 'name email _id');
  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Sirf assigned employee hi submit kar sakta hai
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Aap sirf apne assigned task par submission de sakte hain');
  }

  // Completed task par dubara submit nahi ho sakta
  if (task.status === TASK_STATUS.COMPLETED) {
    throw new ApiError(400, 'Ye task already complete ho chuka hai');
  }

  // Pichla version check karo taaki auto-increment version de sakein (v1, v2, v3...)
  const lastSubmission = await Submission.findOne({ task: task._id }).sort({ version: -1 });
  const nextVersion = lastSubmission ? lastSubmission.version + 1 : 1;

  // Multer se aayi files process karein
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

  // Agar JSON body mein bhi direct file objects bheje gaye hon
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

  // Task ka status under_review update karo
  task.status = TASK_STATUS.UNDER_REVIEW;
  if (progressClaimed !== undefined) {
    task.progress = Math.min(100, Math.max(0, Number(progressClaimed)));
  }
  await task.save();

  // Activity log record karo
  await ActivityLog.create({
    actor: req.user._id,
    action: ACTIVITY_ACTIONS.SUBMISSION_CREATED,
    entityType: ENTITY_TYPES.SUBMISSION,
    entityId: submission._id,
    department: task.department,
    meta: { version: nextVersion, taskTitle: task.title }
  });

  // Manager ko notification bhejo
  const managerId = task.assignedBy?._id || task.assignedBy;
  await notifyTaskSubmitted(task, req.user, managerId);

  const populated = await Submission.findById(submission._id)
    .populate('employee', 'name email avatar')
    .populate('task', 'title status dueDate');

  res.status(201).json(
    new ApiResponse(201, `Deliverable v${nextVersion} submitted successfully`, { submission: populated })
  );
});

// 2. GET /api/submissions?taskId=...
// Kisi task ki saari submissions version history ke saath
const getTaskSubmissions = asyncHandler(async (req, res) => {
  const { taskId } = req.query;
  if (!taskId) throw new ApiError(400, 'taskId query parameter zaroori hai');

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Role aur department authorization
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apne task ki submissions dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ke task ki submissions dekh sakte hain');
    }
  }

  const submissions = await Submission.find({ task: taskId })
    .populate('employee', 'name email avatar')
    .populate('reviewedBy', 'name email avatar')
    .sort({ version: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Task submissions fetch ho gayi', {
      count: submissions.length,
      submissions
    })
  );
});

// 3. GET /api/submissions/:id
// Specific submission ki detail feedback ke saath
const getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('task', 'title description status department assignedTo assignedBy')
    .populate('employee', 'name email avatar')
    .populate('reviewedBy', 'name email avatar');

  if (!submission) throw new ApiError(404, 'Submission nahi mila');

  // Access check
  if (req.user.role === USER_ROLES.EMPLOYEE) {
    if (submission.employee._id.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Aap sirf apna submission dekh sakte hain');
    }
  } else if (req.user.role === USER_ROLES.MANAGER) {
    const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
    if (submission.task.department.toString() !== managerDeptId) {
      throw new ApiError(403, 'Aap sirf apne department ka submission dekh sakte hain');
    }
  }

  // Is submission se jude feedback fetch karein
  const feedbacks = await Feedback.find({ submission: submission._id })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Submission detail', { submission, feedbacks })
  );
});

// 4. PATCH /api/submissions/:id/review (Manager only)
// Manager submission ko approve kare ya changes request kare
const reviewSubmission = asyncHandler(async (req, res) => {
  const { status, feedback, rating } = req.body;

  const submission = await Submission.findById(req.params.id).populate('task');
  if (!submission) throw new ApiError(404, 'Submission nahi mila');

  const task = await Task.findById(submission.task._id).populate('assignedTo', 'name email _id');
  if (!task) throw new ApiError(404, 'Task nahi mila');

  // Manager department check
  const managerDeptId = req.user.department?._id?.toString() || req.user.department?.toString();
  if (task.department.toString() !== managerDeptId) {
    throw new ApiError(403, 'Aap sirf apne department ke submission ko review kar sakte hain');
  }

  // Submission status update
  submission.status = status;
  submission.reviewedBy = req.user._id;
  submission.reviewedAt = new Date();
  await submission.save();

  // Feedback document banayein
  const feedbackDoc = await Feedback.create({
    task: task._id,
    submission: submission._id,
    author: req.user._id,
    type: status === 'approved' ? FEEDBACK_TYPE.APPROVAL : FEEDBACK_TYPE.CHANGE_REQUEST,
    message: feedback,
    rating: rating || null
  });

  // Task ka status update karein
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

// 5. GET /api/submissions/pending (Manager / Superadmin)
// Manager apne department ke saare pending submissions dekhe
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
    new ApiResponse(200, 'Pending submissions fetch ho gayi', {
      count: pendingSubmissions.length,
      submissions: pendingSubmissions
    })
  );
});

// 6. GET /api/submissions/my (Employee)
// Current logged-in employee ke saare submissions
const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ employee: req.user._id })
    .populate('task', 'title priority dueDate status progress')
    .populate('reviewedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'My submissions fetch ho gayi', {
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
