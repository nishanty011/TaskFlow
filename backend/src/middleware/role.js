const ApiError = require('../utils/ApiError');

// Role-based authorization middleware
// Usage: authorize('manager'), authorize('manager', 'superadmin'), etc.
const authorize = (...roles) => {
  return (req, res, next) => {
    // protect middleware se pehle req.user set hona chahiye
    if (!req.user) {
      return next(new ApiError(401, 'Pehle login karein'));
    }

    // Check karein ki user ka role allowed roles me hai ya nahi
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Aapka role (${req.user.role}) is resource ko access karne ke liye authorized nahi hai`
        )
      );
    }

    next();
  };
};

module.exports = { authorize };
