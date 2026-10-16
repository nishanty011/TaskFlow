const mongoose = require('mongoose');
const { FEEDBACK_TYPE } = require('../utils/constants');

// Feedback schema - manager ke review remarks aur rating
const feedbackSchema = new mongoose.Schema(
  {
    // Kis task se related hai
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID zaroori hai']
    },
    // Kis submission version par feedback diya gaya hai
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    },
    // Feedback kisne diya (usually Manager)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID zaroori hai']
    },
    // Feedback type: approval, change_request ya general
    type: {
      type: String,
      enum: Object.values(FEEDBACK_TYPE),
      default: FEEDBACK_TYPE.GENERAL
    },
    // Feedback ka text message
    message: {
      type: String,
      required: [true, 'Feedback message zaroori hai'],
      trim: true
    },
    // Optional rating: 1 se 5 stars
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

// Indexes - task aur submission ke feedback fast load karne ke liye
feedbackSchema.index({ task: 1, submission: 1 });
feedbackSchema.index({ author: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
