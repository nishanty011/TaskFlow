const mongoose = require('mongoose');
const { SUBMISSION_STATUS } = require('../utils/constants');

// Submission file schema - uploaded documents ke liye
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

// Submission schema - employee ka upload versioned document
const submissionSchema = new mongoose.Schema(
  {
    // Kis task ke against submit kiya gaya hai
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID zaroori hai']
    },
    // Kis employee ne submit kiya
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID zaroori hai']
    },
    // Submission version (v1, v2, v3...)
    version: {
      type: Number,
      required: true,
      default: 1
    },
    // Employee ka text answer ya note
    note: {
      type: String,
      trim: true,
      default: ''
    },
    // Uploaded files: PDF, images, docs, zip etc.
    files: [submissionFileSchema],
    // Employee ne kitna progress claim kiya
    progressClaimed: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    // Manager ka review status
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.PENDING
    },
    // Kis manager ne review kiya
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

// Indexes - latest version fast fetch karne ke liye (version -1)
submissionSchema.index({ task: 1, version: -1 });
submissionSchema.index({ employee: 1 });
submissionSchema.index({ task: 1, status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
