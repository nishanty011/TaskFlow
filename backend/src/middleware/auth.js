const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { User } = require('../models');
const { USER_STATUS } = require('../utils/constants');

// Middleware to verify JWT and attach authenticated user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Authentication token missing. Please sign in.');
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback_taskflow_access_secret'
    );

    const user = await User.findById(decoded.id).populate('department');
    if (!user) {
      throw new ApiError(401, 'User linked to this token does not exist.');
    }

    if (user.status === USER_STATUS.SUSPENDED) {
      throw new ApiError(403, 'Your account has been suspended.');
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new ApiError(403, `Your account is not active. Current status: ${user.status}`);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Authentication token is invalid or has expired.');
  }
});

module.exports = { protect };
