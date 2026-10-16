// TaskFlow ke saare constants aur conventions ek jagah
// Ye file baaki saari files mein import hoti hai taaki consistency rahe

// User roles - system mein teen type ke users hain
const USER_ROLES = {
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  SUPERADMIN: 'superadmin'
};

// User status - registration se leke active hone tak ka flow
const USER_STATUS = {
  PENDING_EMAIL: 'pending_email',       // email verify nahi hua
  PENDING_APPROVAL: 'pending_approval', // manager se approval baaki hai
  ACTIVE: 'active',                     // account active hai
  REJECTED: 'rejected',                 // manager ne reject kar diya
  SUSPENDED: 'suspended'                // account suspend hai
};

// Task status - task ka lifecycle (assigned se completed tak)
const TASK_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  COMPLETED: 'completed'
};

// Task priority levels
const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Submission status - jab employee kaam submit karta hai
const SUBMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  CHANGES_REQUESTED: 'changes_requested'
};

// Feedback types - manager ke feedback ka type
const FEEDBACK_TYPE = {
  APPROVAL: 'approval',
  CHANGE_REQUEST: 'change_request',
  GENERAL: 'general'
};

// Notification types - kis cheez ki notification aayi
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

// Activity log actions - kya kya actions track karne hain
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

// Entity types - activity log mein kis entity ka record hai
const ENTITY_TYPES = {
  USER: 'User',
  TASK: 'Task',
  SUBMISSION: 'Submission',
  DEPARTMENT: 'Department',
  FEEDBACK: 'Feedback',
  COMMENT: 'Comment'
};

// File upload limits
const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024,  // 10MB max
  ALLOWED_TYPES: ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 'image/png', 'image/gif',
    'application/zip', 'application/x-zip-compressed',
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
