const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_STATUS } = require('../utils/constants');

// User schema - manager, employee, aur superadmin sab isi collection mein rahenge
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User ka naam zaroori hai'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email zaroori hai'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email address enter karein']
    },
    // Password hash hoga aur queries mein default select nahi hoga
    password: {
      type: String,
      required: [true, 'Password zaroori hai'],
      minlength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
      select: false
    },
    // User ka role: manager, employee ya superadmin
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.EMPLOYEE
    },
    // Kis department se belong karta hai
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    // Account approval status
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.PENDING_EMAIL
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    // Kis manager ne approve kiya
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastLoginAt: {
      type: Date,
      default: null
    },
    // Email OTP verification ke fields
    otpHash: {
      type: String,
      select: false,
      default: null
    },
    otpExpires: {
      type: Date,
      select: false,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Password save karne se pehle bcrypt se hash karein
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match karne ka method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes - fast queries aur data isolation ke liye
// Email unique index already schema definition mein hai
userSchema.index({ department: 1, status: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
