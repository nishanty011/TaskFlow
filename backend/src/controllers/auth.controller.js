const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { User, Department, Notification } = require('../models');
const { USER_ROLES, USER_STATUS, NOTIFICATION_TYPE } = require('../utils/constants');
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
} = require('../utils/token');
const {
  sendVerificationEmail,
  sendManagerApprovalNotification,
  sendPasswordResetEmail
} = require('../services/mail.service');
const { emitToUser } = require('../config/socket');

// Helper: hash 6-digit OTP (SHA256)
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Helper: generate 6-digit random numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. POST /api/auth/register
// Employee sign up: email verification step removed, account goes directly to pending_approval and manager is notified
const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, designation, phone } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'This email address is already registered');
  }

  // Selected department valid and active check
  const dept = await Department.findById(department);
  if (!dept || !dept.isActive) {
    throw new ApiError(400, 'Selected department is not valid');
  }

  // Create user directly with emailVerified: true and status: PENDING_APPROVAL
  const newUser = await User.create({
    name,
    email,
    password,
    department: dept._id,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.PENDING_APPROVAL,
    emailVerified: true,
    designation: designation || '',
    phone: phone || ''
  });

  // Notify Department Manager immediately for approval
  if (dept.manager) {
    const manager = await User.findById(dept.manager);
    if (manager) {
      const notification = await Notification.create({
        user: manager._id,
        type: NOTIFICATION_TYPE.EMPLOYEE_REGISTERED,
        title: 'New Employee Pending Approval',
        message: `${newUser.name} registered for the ${dept.name} department and is waiting for your approval.`,
        link: '/manager/pending-employees'
      });

      emitToUser(manager._id.toString(), 'notification', notification);

      await sendManagerApprovalNotification(
        manager.email,
        manager.name,
        newUser.name,
        dept.name
      );
    }
  }

  res.status(201).json(
    new ApiResponse(201, 'Registration successful! Your account has been submitted to your Department Manager for approval.', {
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      department: dept.name,
      status: newUser.status
    })
  );
});

// 2. POST /api/auth/verify-email
// Verify OTP, set status to pending_approval and notify department manager
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otpHash +otpExpires').populate('department');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.emailVerified) {
    return res.status(200).json(
      new ApiResponse(200, 'Email is already verified.', {
        status: user.status
      })
    );
  }

  // OTP match and expiry check
  if (!user.otpHash || !user.otpExpires) {
    throw new ApiError(400, 'OTP has expired. Please request a new one.');
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(400, 'OTP has expired. Please generate a new OTP.');
  }

  const hashedEnteredOtp = hashOtp(otp);
  if (hashedEnteredOtp !== user.otpHash) {
    throw new ApiError(400, 'Incorrect OTP entered.');
  }

  // Mark email as verified and set status to pending_approval
  user.emailVerified = true;
  user.status = USER_STATUS.PENDING_APPROVAL;
  user.otpHash = null;
  user.otpExpires = null;
  await user.save();

  // Notify department manager
  if (user.department && user.department.manager) {
    const manager = await User.findById(user.department.manager);
    if (manager) {
      // Create In-app Notification
      const notification = await Notification.create({
        user: manager._id,
        type: NOTIFICATION_TYPE.EMPLOYEE_REGISTERED,
        title: 'New Employee Pending Approval',
        message: `${user.name} registered for the ${user.department.name} department and is waiting for your approval.`,
        link: '/manager/pending-employees'
      });

      // Emit real-time notification to manager
      emitToUser(manager._id.toString(), 'notification', notification);

      // Send email notification
      await sendManagerApprovalNotification(
        manager.email,
        manager.name,
        user.name,
        user.department.name
      );
    }
  }

  res.status(200).json(
    new ApiResponse(200, 'Email verified successfully. Your account has been submitted to the department manager for approval.', {
      emailVerified: true,
      status: user.status
    })
  );
});

// 3. POST /api/auth/resend-otp
// Generate and send a new OTP via email
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.emailVerified) {
    throw new ApiError(400, 'Email is already verified. OTP is not required.');
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, 'A new 6-digit OTP has been sent to your email.')
  );
});

// 4. POST /api/auth/login
// Allow active users, block pending/suspended users, return access + refresh tokens
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field selected
  const user = await User.findOne({ email })
    .select('+password')
    .populate('department', 'name code');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Status check - Only ACTIVE users can log in
  // Status check - If user was in pending_email, auto-upgrade to pending_approval
  if (user.status === USER_STATUS.PENDING_EMAIL) {
    user.status = USER_STATUS.PENDING_APPROVAL;
    user.emailVerified = true;
    await user.save();
  }

  if (user.status === USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(403, 'Your account is pending approval by your department manager.', {
      status: USER_STATUS.PENDING_APPROVAL
    });
  }

  if (user.status === USER_STATUS.REJECTED) {
    throw new ApiError(403, 'Your registration request was rejected by your department manager.', {
      status: USER_STATUS.REJECTED
    });
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(403, 'Your account has been suspended. Please contact your administrator.', {
      status: USER_STATUS.SUSPENDED
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set refresh token as httpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

  // Update last login time
  user.lastLoginAt = new Date();
  await user.save();

  // Return user profile without password
  const userProfile = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    designation: user.designation,
    avatar: user.avatar,
    skills: user.skills
  };

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      user: userProfile,
      accessToken
    })
  );
});

// 5. POST /api/auth/refresh
// Read refresh token from cookie and generate a new access token
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is missing. Please sign in again.');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_taskflow_refresh_secret'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(401, 'User is not active or does not exist');
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json(
      new ApiResponse(200, 'Access token refreshed successfully', {
        accessToken: newAccessToken
      })
    );
  } catch (err) {
    clearRefreshTokenCookie(res);
    throw new ApiError(401, 'Refresh token is invalid or has expired');
  }
});

// 6. POST /api/auth/logout
// Clear refresh token cookie
const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);

  res.status(200).json(
    new ApiResponse(200, 'Logged out successfully')
  );
});

// 7. POST /api/auth/forgot-password
// Send password reset OTP via email
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Security best practice: return generic success message even if email doesn't exist
    return res.status(200).json(
      new ApiResponse(200, 'If this email is registered, a password reset OTP has been sent.')
    );
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  await sendPasswordResetEmail(email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, 'A password reset OTP has been sent to your email.')
  );
});

// 8. POST /api/auth/reset-password
// Verify OTP and set a new password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otpHash +otpExpires');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.otpHash || !user.otpExpires) {
    throw new ApiError(400, 'Reset request has expired. Please submit a new request.');
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(400, 'Reset OTP has expired.');
  }

  if (hashOtp(otp) !== user.otpHash) {
    throw new ApiError(400, 'Incorrect OTP entered.');
  }

  // Set new password (pre-save hook will hash it)
  user.password = newPassword;
  user.otpHash = null;
  user.otpExpires = null;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Password has been reset successfully. You can now sign in with your new password.')
  );
});

// 9. GET /api/auth/me
// Fetch current authenticated user's details
const getMe = asyncHandler(async (req, res) => {
  // protect middleware sets req.user
  const user = await User.findById(req.user._id).populate('department', 'name code');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Current user details', { user })
  );
});

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
