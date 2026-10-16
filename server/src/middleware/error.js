const ApiError = require('../utils/ApiError');

// Global error handler - saare errors yahan aake handle hote hain
// Ye middleware Express ke error handling ka last point hai
const errorHandler = (err, req, res, next) => {

  // Agar hamara custom ApiError hai toh uski values use karo
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Server mein kuch gadbad ho gayi',
    errors: err.errors || []
  };

  // Mongoose validation error - jab required field missing ho ya enum match na kare
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error.statusCode = 400;
    error.message = 'Validation Failed';
    error.errors = messages;
  }

  // Mongoose duplicate key error - jab unique field ki value already exist kare
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.statusCode = 409;
    error.message = `${field} already exists`;
  }

  // Mongoose bad ObjectId - jab galat format ka ID bheja jaye
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT token errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Token valid nahi hai, dobara login karo';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token expire ho gaya hai, dobara login karo';
  }

  // Development mein full error stack dikhao, production mein nahi
  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  console.error('Error:', err);

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
