// TaskFlow system constants

const USER_ROLES = {
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  SUPERADMIN: 'superadmin'
};

const USER_STATUS = {
  PENDING_EMAIL: 'pending_email',
  PENDING_APPROVAL: 'pending_approval',
  ACTIVE: 'active',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

const TASK_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  COMPLETED: 'completed'
};

const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested'
};

const FEEDBACK_TYPE = {
  APPROVAL: 'approval',
  CHANGE_REQUEST: 'change_request',
  GENERAL: 'general'
};

const NOTIFICATION_TYPE = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_SUBMITTED: 'task_submitted',
  TASK_APPROVED: 'task_approved',
  CHANGES_REQUESTED: 'changes_requested',
  EMPLOYEE_REGISTERED: 'employee_registered',
  EMPLOYEE_APPROVED: 'employee_approved',
  EMPLOYEE_REJECTED: 'employee_rejected',
  DEADLINE_REMINDER: 'deadline_reminder',
  TASK_OVERDUE: 'task_overdue',
  COMMENT_ADDED: 'comment_added'
};

const ACTIVITY_ACTIONS = {
  USER_REGISTERED: 'user_registered',
  USER_APPROVED: 'user_approved',
  USER_REJECTED: 'user_rejected',
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_SUBMITTED: 'task_submitted',
  TASK_APPROVED: 'task_approved',
  TASK_CHANGES_REQUESTED: 'task_changes_requested',
  SUBMISSION_CREATED: 'submission_created',
  FEEDBACK_GIVEN: 'feedback_given',
  COMMENT_ADDED: 'comment_added'
};

const ENTITY_TYPES = {
  USER: 'User',
  TASK: 'Task',
  SUBMISSION: 'Submission',
  DEPARTMENT: 'Department',
  FEEDBACK: 'Feedback',
  COMMENT: 'Comment'
};

const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain'
  ]
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  SUBMISSION_STATUS,
  FEEDBACK_TYPE,
  NOTIFICATION_TYPE,
  ACTIVITY_ACTIONS,
  ENTITY_TYPES,
  FILE_CONFIG
};
