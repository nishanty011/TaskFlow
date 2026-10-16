const nodemailer = require('nodemailer');

// Nodemailer transport create karein
const createTransporter = () => {
  // Agar valid email credentials na ho toh console logger use karein
  if (
    !process.env.EMAIL_USER ||
    process.env.EMAIL_USER === 'your_email@gmail.com'
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // TLS use hoga port 587 par
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// 1. Email verification OTP bhejne ka function
const sendVerificationEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  // Development ya bina SMTP credentials ke console par log karein
  if (!transporter) {
    console.log('\n--- EMAIL SIMULATION (Local Dev) ---');
    console.log(`To: ${email} (${name})`);
    console.log(`Subject: TaskFlow - Verify your email address`);
    console.log(`Your 6-digit OTP is: ${otp} (Valid for 10 minutes)`);
    console.log('------------------------------------\n');
    return true;
  }

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'TaskFlow - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to TaskFlow</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering on TaskFlow. Please use the following 6-digit OTP to verify your email address:</p>
        <div style="background-color: #f3f4f6; text-align: center; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. If you did not sign up for TaskFlow, you can safely ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send karne mein error aaya:', error.message);
    // Dev environment mein error throw na karein
    return false;
  }
};

// 2. Department Manager ko notification email bhejna jab naya employee request kare
const sendManagerApprovalNotification = async (managerEmail, managerName, employeeName, departmentName) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n--- EMAIL SIMULATION (Local Dev) ---');
    console.log(`To Manager: ${managerEmail} (${managerName})`);
    console.log(`Subject: New Employee Pending Approval: ${employeeName}`);
    console.log(`Department: ${departmentName}`);
    console.log('------------------------------------\n');
    return true;
  }

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: managerEmail,
    subject: `TaskFlow - New Employee Approval Request: ${employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2563eb;">New Employee Approval Request</h2>
        <p>Hello <strong>${managerName}</strong>,</p>
        <p>A new employee <strong>${employeeName}</strong> has registered for the <strong>${departmentName}</strong> department and verified their email.</p>
        <p>Please review and approve their account from your Manager Dashboard.</p>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/manager/pending-employees" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Go to Pending Approvals
          </a>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Manager notification email bhejne mein error:', error.message);
    return false;
  }
};

// 3. Password reset OTP email
const sendPasswordResetEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n--- EMAIL SIMULATION (Local Dev) ---');
    console.log(`To: ${email} (${name})`);
    console.log(`Subject: TaskFlow - Password Reset OTP`);
    console.log(`Reset OTP: ${otp} (Valid for 15 minutes)`);
    console.log('------------------------------------\n');
    return true;
  }

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'TaskFlow - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #fef2f2; text-align: center; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #dc2626; border-radius: 6px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>15 minutes</strong>. If you did not request this, please change your password immediately.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email error:', error.message);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendManagerApprovalNotification,
  sendPasswordResetEmail
};
