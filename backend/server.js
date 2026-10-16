const http = require('http');
const dotenv = require('dotenv');

// .env load karein sabse pehle
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// HTTP server create karein taaki Express aur Socket.io dono ek hi port par run ho sakein
const server = http.createServer(app);

// Socket.io initialize karein
initSocket(server);

// Database connect karein aur server start karein
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server chal raha hai port ${PORT} par`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Server start nahi ho paya:', error.message);
    process.exit(1);
  }
};

// Unhandled promise rejections handle karein
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Uncaught exceptions handle karein
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();
