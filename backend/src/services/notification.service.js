const { Notification } = require('../models');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { emitToUser, emitToDepartment } = require('../config/socket');

// Task assignment notification - employee ko batao naya task mila
const notifyTaskAssigned = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.TASK_ASSIGNED,
      title: 'Naya Task Assign Hua!',
      message: `${manager.name} ne aapko ek naya task assign kiya hai: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'task_assigned', { task });
  } catch (err) {
    console.error('Task assign notification error:', err.message);
  }
};

// Task submission notification - manager ko batao kisi ne submit kiya
const notifyTaskSubmitted = async (task, employee, managerId) => {
  try {
    const notification = await Notification.create({
      user: managerId,
      type: NOTIFICATION_TYPE.TASK_SUBMITTED,
      title: 'Naya Submission Review Ke Liye',
      message: `${employee.name} ne task submit kar diya hai: "${task.title}"`,
      link: `/tasks/${task._id}/review`
    });
    emitToUser(managerId.toString(), 'notification', notification);
    emitToUser(managerId.toString(), 'task_submitted', { task, employee });
  } catch (err) {
    console.error('Task submission notification error:', err.message);
  }
};

// Manager approved - employee ko batao task approve ho gaya
const notifyTaskApproved = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.TASK_APPROVED,
      title: 'Task Approve Ho Gaya!',
      message: `${manager.name} ne aapka task approve kar diya hai: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'task_approved', { task });
  } catch (err) {
    console.error('Task approval notification error:', err.message);
  }
};

// Manager ne changes request kiye - employee ko batao
const notifyChangesRequested = async (task, employee, manager) => {
  try {
    const notification = await Notification.create({
      user: employee._id,
      type: NOTIFICATION_TYPE.CHANGES_REQUESTED,
      title: 'Changes Requested',
      message: `${manager.name} ne aapke task mein changes request kiye hain: "${task.title}"`,
      link: `/tasks/${task._id}`
    });
    emitToUser(employee._id.toString(), 'notification', notification);
    emitToUser(employee._id.toString(), 'changes_requested', { task });
  } catch (err) {
    console.error('Changes request notification error:', err.message);
  }
};

// New comment notification - mentioned users ko batao
const notifyComment = async (task, comment, author, mentionedUserIds = []) => {
  try {
    // Saare mentioned users ko notification bhejo
    for (const userId of mentionedUserIds) {
      if (userId.toString() !== author._id.toString()) {
        const notification = await Notification.create({
          user: userId,
          type: NOTIFICATION_TYPE.COMMENT_ADDED,
          title: 'Aapko Mention Kiya Gaya!',
          message: `${author.name} ne aapko task "${task.title}" ke comment mein mention kiya hai`,
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
