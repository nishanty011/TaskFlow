const mongoose = require('mongoose');

// Attachment subschema for comments
const commentAttachmentSchema = new mongoose.Schema(
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

// Comment schema - task ke discussion thread ke liye
const commentSchema = new mongoose.Schema(
  {
    // Kis task ka discussion thread hai
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID zaroori hai']
    },
    // Comment likhne wala user
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author zaroori hai']
    },
    // Comment text
    message: {
      type: String,
      required: [true, 'Message text zaroori hai'],
      trim: true
    },
    // Optional file attachments
    attachments: [commentAttachmentSchema],
    // Tagged users (@mentions)
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes - task discussion thread ko time ke hisaab se order mein lane ke liye
commentSchema.index({ task: 1, createdAt: 1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
