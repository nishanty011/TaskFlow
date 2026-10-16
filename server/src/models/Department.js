const mongoose = require('mongoose');

// Department schema - har department ka ek document hoga
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name zaroori hai'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Department code zaroori hai'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    // Department ka assigned manager (User reference)
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // Soft delete ya status track karne ke liye
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
