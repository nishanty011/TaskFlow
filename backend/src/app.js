const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
const ApiError = require('./utils/ApiError');

const app = express();

// Security headers - basic security ke liye
app.use(helmet());

// CORS - frontend se requests allow karne ke liye
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Request body parsing - JSON aur form data samajhne ke liye
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookies parse karne ke liye (refresh token cookie mein store hoga)
app.use(cookieParser());

// HTTP request logs - development mein debugging ke liye
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Master API routes - saare sub-routes /api ke under aate hain
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Jab koi route match na kare toh 404 bhejo
app.use((req, res, next) => {
  next(new ApiError(404, `Route nahi mili: ${req.originalUrl}`));
});

// Global error handler - sabse last mein
app.use(errorHandler);

module.exports = app;
