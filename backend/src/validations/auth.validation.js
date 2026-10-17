const { z } = require('zod');

// Registration validation schema
const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    department: z.string({ required_error: 'Please select a department' }),
    designation: z.string().optional().default(''),
    phone: z.string().optional().default('')
  })
});

// Email verification OTP validation
const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim(),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 digits')
  })
});

// Resend OTP validation
const resendOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim()
  })
});

// Login validation schema
const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim(),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Please enter your password')
  })
});

// Forgot password schema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim()
  })
});

// Reset password schema
const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Please enter a valid email address').toLowerCase().trim(),
    otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 digits'),
    newPassword: z.string({ required_error: 'New password is required' }).min(6, 'Password must be at least 6 characters')
  })
});

module.exports = {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
