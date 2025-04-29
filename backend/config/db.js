require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      maxPoolSize: 10 // Maximum connections
    });

    console.log('✅ MongoDB connected successfully');

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB cluster');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handler
const shutdownDB = async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination');
  process.exit(0);
};

// For nodemon restarts
process.once('SIGUSR2', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected (nodemon restart)');
    process.kill(process.pid, 'SIGUSR2');
  });
});

module.exports = { 
  connectDB, 
  shutdownDB,
  config: {
    PORT: process.env.PORT || 5000
  }
};