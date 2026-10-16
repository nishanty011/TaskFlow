const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// Login rate limiter - brute force protection (15 minutes me max 5 attempts)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts allowed
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Bahut saare login attempts ho gaye hain. Kripya 15 minute baad koshish karein.'));
  }
});

// OTP verification and request limiter - (15 minutes me max 5 OTP requests)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Bahut saare OTP requests ho gaye hain. Thoda intezar karein aur baad me try karein.'));
  }
});

module.exports = {
  loginLimiter,
  otpLimiter
};
