const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models');
const { USER_STATUS } = require('../utils/constants');

// Protect middleware - JWT verify karke authenticated user load karta hai
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization header se Bearer token extract karein
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing hai. Kripya login karein.');
  }

  try {
    // JWT verify karein
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback_taskflow_access_secret'
    );

    // User database se load karein
    const user = await User.findById(decoded.id).populate('department');
    if (!user) {
      throw new ApiError(401, 'Token se linked user exist nahi karta.');
    }

    // Status check - agar user suspended ya inactive hai toh access reject karein
    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(403, 'Aapka account suspend kar diya gaya hai.');
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(403, `Aapka account active nahi hai. Current status: ${user.status}`);
    }

    // Authenticated user ko request object me attach karein
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Token valid nahi hai ya expire ho chuka hai.');
  }
});

module.exports = { protect };
