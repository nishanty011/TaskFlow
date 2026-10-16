const jwt = require('jsonwebtoken');

// Short-lived Access Token (15 minutes) generate karne ka function
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department
    },
    process.env.JWT_ACCESS_SECRET || 'fallback_taskflow_access_secret',
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
    }
  );
};

// Long-lived Refresh Token (7 days) generate karne ka function
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id
    },
    process.env.JWT_REFRESH_SECRET || 'fallback_taskflow_refresh_secret',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
    }
  );
};

// Refresh token ko httpOnly cookie mein store karne ka helper
const setRefreshTokenCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // XSS attack se bachane ke liye (JS access nahi kar sakti)
    secure: isProduction, // Production mein HTTPS par hi bhejna
    sameSite: isProduction ? 'none' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// Refresh token cookie clear karne ka helper (logout ke waqt)
const clearRefreshTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0)
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie
};
