const mongoose = require('mongoose');
const { SUBMISSION_STATUS } = require('../utils/constants');

const submissionFileSchema = new mongoose.Schema(
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

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required']
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    files: [submissionFileSchema],
    progressClaimed: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.PENDING
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

submissionSchema.index({ task: 1, version: -1 });
submissionSchema.index({ employee: 1 });
submissionSchema.index({ task: 1, status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
