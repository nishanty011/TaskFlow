// Custom Error class - API errors ko handle karne ke liye
// Isse hum apne custom error messages aur status codes bhej sakte hain
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}

module.exports = ApiError;
