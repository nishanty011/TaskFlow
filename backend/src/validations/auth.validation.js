const { z } = require('zod');

// Registration validation schema
const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Naam enter karna zaroori hai' }).min(2, 'Naam kam se kam 2 characters ka hona chahiye').trim(),
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email address enter karein').toLowerCase().trim(),
    password: z.string({ required_error: 'Password zaroori hai' }).min(6, 'Password kam se kam 6 characters ka hona chahiye'),
    department: z.string({ required_error: 'Department select karna zaroori hai' }),
    designation: z.string().optional().default(''),
    phone: z.string().optional().default('')
  })
});

// Email verification OTP validation
const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email address enter karein').toLowerCase().trim(),
    otp: z.string({ required_error: 'OTP enter karna zaroori hai' }).length(6, 'OTP exactly 6 digits ka hona chahiye')
  })
});

// Resend OTP validation
const resendOtpSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email address enter karein').toLowerCase().trim()
  })
});

// Login validation schema
const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email enter karein').toLowerCase().trim(),
    password: z.string({ required_error: 'Password zaroori hai' }).min(1, 'Password enter karein')
  })
});

// Forgot password schema
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email enter karein').toLowerCase().trim()
  })
});

// Reset password schema
const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email zaroori hai' }).email('Valid email enter karein').toLowerCase().trim(),
    otp: z.string({ required_error: 'OTP enter karna zaroori hai' }).length(6, 'OTP exactly 6 digits ka hona chahiye'),
    newPassword: z.string({ required_error: 'Naya password zaroori hai' }).min(6, 'Password kam se kam 6 characters ka hona chahiye')
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
