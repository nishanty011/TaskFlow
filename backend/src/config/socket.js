const { Server } = require('socket.io');

let io = null;

// Socket.io initialize karne ka function
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Jab user connect kare toh apne user room me join kare
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Department-level notifications ke liye department room join kare
    socket.on('join_department', (deptId) => {
      if (deptId) {
        socket.join(`dept_${deptId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
};

// IO instance lene ka helper
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io initialize nahi hua hai!');
  }
  return io;
};

// Specific user ko notification bhejne ka helper
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

// Pure department ko notification bhejne ka helper
const emitToDepartment = (deptId, event, data) => {
  if (io) {
    io.to(`dept_${deptId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToDepartment
};
