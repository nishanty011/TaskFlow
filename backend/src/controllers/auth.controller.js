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

// 6-digit OTP hash karne ka helper (SHA256)
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// 6-digit random numeric OTP generate karne ka helper
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. POST /api/auth/register
// Employee sign up karega, email verify hone tak status pending_email rahega
const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, designation, phone } = req.body;

  // Check karein ki email already registered toh nahi hai
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Ye email address already registered hai');
  }

  // Selected department valid aur active hai ya nahi verify karein
  const dept = await Department.findById(department);
  if (!dept || !dept.isActive) {
    throw new ApiError(400, 'Selected department valid nahi hai');
  }

  // 6-digit OTP create karein aur 10 minutes expiry set karein
  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // User create karein (status: pending_email, role: employee)
  const newUser = await User.create({
    name,
    email,
    password,
    department: dept._id,
    role: USER_ROLES.EMPLOYEE,
    status: USER_STATUS.PENDING_EMAIL,
    emailVerified: false,
    designation: designation || '',
    phone: phone || '',
    otpHash,
    otpExpires
  });

  // Verification email bhejein
  await sendVerificationEmail(email, name, otp);

  res.status(201).json(
    new ApiResponse(201, 'Registration successful. Kripya apne email par bheja gaya 6-digit OTP verify karein.', {
      userId: newUser._id,
      email: newUser.email,
      department: dept.name
    })
  );
});

// 2. POST /api/auth/verify-email
// OTP verify karein, status = pending_approval aur department manager ko notify karein
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select('+otpHash +otpExpires').populate('department');
  if (!user) {
    throw new ApiError(404, 'User nahi mila');
  }

  if (user.emailVerified) {
    return res.status(200).json(
      new ApiResponse(200, 'Email already verified hai.', {
        status: user.status
      })
    );
  }

  // OTP match aur expiry check karein
  if (!user.otpHash || !user.otpExpires) {
    throw new ApiError(400, 'OTP expire ho chuka hai. Naya OTP request karein.');
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(400, 'OTP expire ho gaya hai. Kripya naya OTP generate karein.');
  }

  const hashedEnteredOtp = hashOtp(otp);
  if (hashedEnteredOtp !== user.otpHash) {
    throw new ApiError(400, 'Galat OTP enter kiya hai.');
  }

  // Email verify mark karein aur status ko pending_approval karein
  user.emailVerified = true;
  user.status = USER_STATUS.PENDING_APPROVAL;
  user.otpHash = null;
  user.otpExpires = null;
  await user.save();

  // Department ke manager ko notification bhejein
  if (user.department && user.department.manager) {
    const manager = await User.findById(user.department.manager);
    if (manager) {
      // In-app Notification create karein
      const notification = await Notification.create({
        user: manager._id,
        type: NOTIFICATION_TYPE.EMPLOYEE_REGISTERED,
        title: 'New Employee Pending Approval',
        message: `${user.name} ne ${user.department.name} department ke liye register kiya hai aur approval ka wait kar rahe hain.`,
        link: '/manager/pending-employees'
      });

      // Socket.io se manager ke room me real-time alert bhejein
      emitToUser(manager._id.toString(), 'notification', notification);

      // Email notification bhejein
      await sendManagerApprovalNotification(
        manager.email,
        manager.name,
        user.name,
        user.department.name
      );
    }
  }

  res.status(200).json(
    new ApiResponse(200, 'Email successfully verify ho gaya hai. Aapka account department manager ke approval ke liye bhej diya gaya hai.', {
      emailVerified: true,
      status: user.status
    })
  );
});

// 3. POST /api/auth/resend-otp
// Naya OTP generate karke email karein
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User nahi mila');
  }

  if (user.emailVerified) {
    throw new ApiError(400, 'Email already verified hai, OTP ki zaroorat nahi hai');
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, 'Naya 6-digit OTP aapke email par bhej diya gaya hai.')
  );
});

// 4. POST /api/auth/login
// Active users ko allow karein, pending/suspended ko block karein, access + refresh token return karein
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Password select karke user find karein
  const user = await User.findOne({ email })
    .select('+password')
    .populate('department', 'name code');

  if (!user) {
    throw new ApiError(401, 'Email ya password galat hai');
  }

  // Password verify karein
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Email ya password galat hai');
  }

  // Status check - Sirf ACTIVE users login kar sakte hain
  if (user.status === USER_STATUS.PENDING_EMAIL) {
    throw new ApiError(403, 'Aapka email verify nahi hua hai. Kripya pehle OTP se email verify karein.', {
      status: USER_STATUS.PENDING_EMAIL
    });
  }

  if (user.status === USER_STATUS.PENDING_APPROVAL) {
    throw new ApiError(403, 'Aapka account abhi department manager ke approval ke liye pending hai.', {
      status: USER_STATUS.PENDING_APPROVAL
    });
  }

  if (user.status === USER_STATUS.REJECTED) {
    throw new ApiError(403, 'Aapka registration request department manager dwara reject kar diya gaya hai.', {
      status: USER_STATUS.REJECTED
    });
  }

  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ApiError(403, 'Aapka account suspend kar diya gaya hai. Administrator se sampark karein.', {
      status: USER_STATUS.SUSPENDED
    });
  }

  // Tokens generate karein
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Refresh token ko httpOnly cookie mein set karein
  setRefreshTokenCookie(res, refreshToken);

  // Last login time update karein
  user.lastLoginAt = new Date();
  await user.save();

  // Password hata ke user profile return karein
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
// Cookie se refresh token padh ke naya access token generate karein
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token missing hai, dobara login karein');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_taskflow_refresh_secret'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(401, 'User active nahi hai ya exist nahi karta');
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json(
      new ApiResponse(200, 'Access token refreshed successfully', {
        accessToken: newAccessToken
      })
    );
  } catch (err) {
    clearRefreshTokenCookie(res);
    throw new ApiError(401, 'Refresh token invalid ya expire ho gaya hai');
  }
});

// 6. POST /api/auth/logout
// Cookie clear karein
const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);

  res.status(200).json(
    new ApiResponse(200, 'Logout successfully complete ho gaya')
  );
});

// 7. POST /api/auth/forgot-password
// Reset password OTP email karein
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Security best practice: email exist na karne par bhi generic success message de sakte hain
    return res.status(200).json(
      new ApiResponse(200, 'Agar email registered hai toh reset OTP bhej diya gaya hai.')
    );
  }

  const otp = generateOtp();
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save();

  await sendPasswordResetEmail(email, user.name, otp);

  res.status(200).json(
    new ApiResponse(200, 'Password reset OTP aapke email par bhej diya gaya hai.')
  );
});

// 8. POST /api/auth/reset-password
// OTP verify karke naya password set karein
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otpHash +otpExpires');
  if (!user) {
    throw new ApiError(404, 'User nahi mila');
  }

  if (!user.otpHash || !user.otpExpires) {
    throw new ApiError(400, 'Reset request expire ho chuki hai. Kripya naya request karein.');
  }

  if (new Date() > user.otpExpires) {
    throw new ApiError(400, 'Reset OTP expire ho gaya hai.');
  }

  if (hashOtp(otp) !== user.otpHash) {
    throw new ApiError(400, 'Galat OTP enter kiya hai.');
  }

  // Naya password set karein (pre-save hook hash karega)
  user.password = newPassword;
  user.otpHash = null;
  user.otpExpires = null;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, 'Password successfully reset ho gaya hai. Ab aap naye password se login kar sakte hain.')
  );
});

// 9. GET /api/auth/me
// Current authenticated user ki details fetch karein
const getMe = asyncHandler(async (req, res) => {
  // protect middleware req.user set karega
  const user = await User.findById(req.user._id).populate('department', 'name code');
  if (!user) {
    throw new ApiError(404, 'User nahi mila');
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
