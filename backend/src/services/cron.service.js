const cron = require('node-cron');
const { Task, Notification, User } = require('../models');
const { TASK_STATUS, NOTIFICATION_TYPE } = require('../utils/constants');
const { emitToUser } = require('../config/socket');

// Overdue tasks check karein aur alert bhejein
const checkOverdueTasks = async () => {
  try {
    const now = new Date();
    // Jo tasks abhi tak complete nahi huye aur dueDate guzar chuki hai
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $nin: [TASK_STATUS.COMPLETED] },
      isArchived: false
    })
      .populate('assignedTo', 'name email _id')
      .populate('assignedBy', 'name email _id');

    for (const task of overdueTasks) {
      if (!task.assignedTo) continue;

      // Duplicate notification na jaye - check karo pichle 24 ghante mein notification gayi thi kya
      const recentNotif = await Notification.findOne({
        user: task.assignedTo._id,
        type: NOTIFICATION_TYPE.TASK_OVERDUE,
        link: `/tasks/${task._id}`,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!recentNotif) {
        // Overdue alert to employee
        const empNotif = await Notification.create({
          user: task.assignedTo._id,
          type: NOTIFICATION_TYPE.TASK_OVERDUE,
          title: 'Task Overdue Alert',
          message: `Your task "${task.title}" has passed its due date. Please complete and submit it as soon as possible.`,
          link: `/tasks/${task._id}`
        });
        emitToUser(task.assignedTo._id.toString(), 'notification', empNotif);

        // Alert to manager if task has assigner
        if (task.assignedBy) {
          const mgrNotif = await Notification.create({
            user: task.assignedBy._id,
            type: NOTIFICATION_TYPE.TASK_OVERDUE,
            title: 'Department Task Overdue Alert',
            message: `${task.assignedTo.name}'s task "${task.title}" is now overdue.`,
            link: `/tasks/${task._id}`
          });
          emitToUser(task.assignedBy._id.toString(), 'notification', mgrNotif);
        }
      }
    }

    return overdueTasks.length;
  } catch (error) {
    console.error('Overdue cron error:', error.message);
    return 0;
  }
};

// Send reminder for tasks due in next 24 hours
const sendDeadlineReminders = async () => {
  try {
    const now = new Date();
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const upcomingTasks = await Task.find({
      dueDate: { $gte: now, $lte: in24Hours },
      status: { $nin: [TASK_STATUS.COMPLETED, TASK_STATUS.UNDER_REVIEW] },
      isArchived: false
    }).populate('assignedTo', 'name email _id');

    for (const task of upcomingTasks) {
      if (!task.assignedTo) continue;

      const recentNotif = await Notification.findOne({
        user: task.assignedTo._id,
        type: NOTIFICATION_TYPE.DEADLINE_REMINDER,
        link: `/tasks/${task._id}`,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (!recentNotif) {
        const notif = await Notification.create({
          user: task.assignedTo._id,
          type: NOTIFICATION_TYPE.DEADLINE_REMINDER,
          title: 'Deadline Reminder',
          message: `Your task "${task.title}" is due within the next 24 hours!`,
          link: `/tasks/${task._id}`
        });
        emitToUser(task.assignedTo._id.toString(), 'notification', notif);
      }
    }

    return upcomingTasks.length;
  } catch (error) {
    console.error('Deadline reminder cron error:', error.message);
    return 0;
  }
};

// Cron jobs initialize karein
const initCronJobs = () => {
  // Har ghante overdue tasks check karein
  cron.schedule('0 * * * *', () => {
    checkOverdueTasks();
  });

  // Har roz subah 9:00 baje deadline reminders bhejein
  cron.schedule('0 9 * * *', () => {
    sendDeadlineReminders();
  });
};

module.exports = {
  initCronJobs,
  checkOverdueTasks,
  sendDeadlineReminders
};
