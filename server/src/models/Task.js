const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY } = require('../utils/constants');

// Attachment schema - task ke files ke liye
const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 0
    },
    mime: {
      type: String,
      default: ''
    }
  },
  { _id: true }
);

// Checklist item schema - subtask aur progress calculation ke liye
const checklistItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      default: 1,
      min: 1
    },
    done: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

// Task schema - assignments, deadlines, aur status tracking ke liye
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title zaroori hai'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // Task kis department ka hai
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department zaroori hai']
    },
    // Kis manager ne task assign kiya
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned by manager zaroori hai']
    },
    // Kis employee ko task mila
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned to employee zaroori hai']
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.ASSIGNED
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date zaroori hai']
    },
    // Manager ke upload kiye huye attachments
    attachments: [attachmentSchema],
    // Checklist items jisse progress calculate hoti hai
    checklist: [checklistItemSchema],
    // Progress percentage (0 se 100 tak) - manager approval par update hoti hai
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    estimatedHours: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    // Soft delete ke liye
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Virtual field: overdue check karne ke liye (database mein store nahi hota, compute hota hai)
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === TASK_STATUS.COMPLETED) {
    return false;
  }
  return this.dueDate && new Date(this.dueDate) < new Date();
});

// JSON output mein virtuals include karein
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

// Indexes - department isolation aur dashboard queries ko super fast banane ke liye
// 1. Employee dashboard: employee apne active/completed tasks fast filter kar sake
taskSchema.index({ assignedTo: 1, status: 1 });
// 2. Department tasks by deadline (overdue & upcoming tasks fast fetch karne ke liye)
taskSchema.index({ department: 1, dueDate: 1 });
// 3. Manager dashboard: department ke status-wise tasks (e.g. submitted, in_progress)
taskSchema.index({ department: 1, status: 1 });
// 4. Department active vs archived tasks
taskSchema.index({ department: 1, isArchived: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
