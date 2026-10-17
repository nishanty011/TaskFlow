const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validations/auth.validation');

// 1. Employee Registration
router.post('/register', otpLimiter, validate(registerSchema), authController.register);

// 2. Email verification OTP
router.post('/verify-email', otpLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/verify-otp', otpLimiter, validate(verifyEmailSchema), authController.verifyEmail);

// 3. Resend OTP
router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), authController.resendOtp);

// 4. User Login
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

// 5. Refresh JWT Token
router.post('/refresh', authController.refresh);
router.post('/refresh-token', authController.refresh);

// 6. User Logout
router.post('/logout', authController.logout);

// 7. Forgot Password
router.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// 8. Reset Password
router.post('/reset-password', otpLimiter, validate(resetPasswordSchema), authController.resetPassword);

// 9. Current User Profile
router.get('/me', protect, authController.getMe);

module.exports = router;
