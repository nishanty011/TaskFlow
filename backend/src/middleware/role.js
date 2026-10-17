const ApiError = require('../utils/ApiError');

// Role-based authorization middleware
// Usage: authorize('manager'), authorize('manager', 'superadmin'), etc.
const authorize = (...roles) => {
  return (req, res, next) => {
    // protect middleware should set req.user
    if (!req.user) {
      return next(new ApiError(401, 'Please sign in first'));
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Your role (${req.user.role}) is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
