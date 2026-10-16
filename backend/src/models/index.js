// Saare models ko ek hi jagah se import karne ke liye index file
const User = require('./User');
const Department = require('./Department');
const Task = require('./Task');
const Submission = require('./Submission');
const Feedback = require('./Feedback');
const Comment = require('./Comment');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

module.exports = {
  User,
  Department,
  Task,
  Submission,
  Feedback,
  Comment,
  Notification,
  ActivityLog
};
