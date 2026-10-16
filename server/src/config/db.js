const mongoose = require('mongoose');

// MongoDB se connect karne ka function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Agar connection toot jaye toh log karo
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    // Agar connection disconnect ho jaye
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Reconnect karne ki koshish ho rahi hai...');
    });

  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
