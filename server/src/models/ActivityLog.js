const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS, ENTITY_TYPES } = require('../utils/constants');

// ActivityLog schema - audit trail ke liye (who did what and when)
const activityLogSchema = new mongoose.Schema(
  {
    // Kis user ne action perform kiya
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor ID zaroori hai']
    },
    // Kya action liya gaya
    action: {
      type: String,
      enum: Object.values(ACTIVITY_ACTIONS),
      required: [true, 'Action name zaroori hai']
    },
    // Kis entity type par action hua (Task, User, Submission, etc.)
    entityType: {
      type: String,
      enum: Object.values(ENTITY_TYPES),
      required: [true, 'Entity type zaroori hai']
    },
    // Target entity ki ID
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID zaroori hai']
    },
    // Kis department se related activity hai (data isolation ke liye)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department ID zaroori hai']
    },
    // Additional details ya metadata object
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes - department audit log aur actor history fast fetch karne ke liye
activityLogSchema.index({ department: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
