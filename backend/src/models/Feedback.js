const mongoose = require('mongoose');
const { FEEDBACK_TYPE } = require('../utils/constants');

const feedbackSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required']
    },
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required']
    },
    type: {
      type: String,
      enum: Object.values(FEEDBACK_TYPE),
      default: FEEDBACK_TYPE.GENERAL
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  {
    timestamps: true
  }
);

feedbackSchema.index({ task: 1, submission: 1 });
feedbackSchema.index({ author: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
