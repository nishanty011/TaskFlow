const { Notification } = require('../models');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { emitToUser, emitToDepartment } = require('../config/socket');

// Task assignment notification - notify employee of new assigned task
const notifyTaskAssigned = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `${manager.name} assigned you a new task: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'task_assigned', { task });
  } catch (err) {
    console.error('Task assign notification error:', err.message);
  }
};

// Task submission notification - notify manager of new submission
const notifyTaskSubmitted = async (task, employee, managerId) => {
  try {
    const notification = await Notification.create({
      user: managerId,
      type: NOTIFICATION_TYPE.TASK_SUBMITTED,
      title: 'New Submission for Review',
      message: `${employee.name} submitted work for review: "${task.title}"`,
      link: `/tasks/${task._id}/review`
    });
    emitToUser(managerId.toString(), 'notification', notification);
    emitToUser(managerId.toString(), 'task_submitted', { task, employee });
  } catch (err) {
    console.error('Task submission notification error:', err.message);
  }
};

// Manager approved - notify employee that task was approved
const notifyTaskApproved = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.TASK_APPROVED,
      title: 'Task Approved!',
      message: `${manager.name} approved your task: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'task_approved', { task });
  } catch (err) {
    console.error('Task approval notification error:', err.message);
  }
};

// Manager requested changes - notify employee
const notifyChangesRequested = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.CHANGES_REQUESTED,
      title: 'Changes Requested',
      message: `${manager.name} requested changes on your task: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'changes_requested', { task });
  } catch (err) {
    console.error('Changes request notification error:', err.message);
  }
};

// New comment notification - notify mentioned users
const notifyComment = async (task, comment, author, mentionedUserIds = []) => {
  try {
    for (const userId of mentionedUserIds) {
      if (userId.toString() !== author._id.toString()) {
        const notification = await Notification.create({
          user: userId,
          type: NOTIFICATION_TYPE.COMMENT_ADDED,
          title: 'You were mentioned',
          message: `${author.name} mentioned you in a comment on task "${task.title}"`,
          link: `/tasks/${task._id}`
        });
        emitToUser(userId.toString(), 'notification', notification);
      }
    }
  } catch (err) {
    console.error('Comment notification error:', err.message);
  }
};

module.exports = {
  notifyTaskAssigned,
  notifyTaskSubmitted,
  notifyTaskApproved,
  notifyChangesRequested,
  notifyComment
};
