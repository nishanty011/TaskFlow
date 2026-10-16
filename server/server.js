const dotenv = require('dotenv');

// .env file load karo sabse pehle - baaki sab se pehle ye hona chahiye
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Database connect karo aur phir server start karo
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server chal raha hai port ${PORT} par`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('Server start nahi ho paya:', error.message);
    process.exit(1);
  }
};

// Unhandled promise rejections pakdo - agar koi promise fail ho bina catch ke
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Uncaught exceptions pakdo
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
