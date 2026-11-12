const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');


const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI ||
    (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/candidate-evaluation');

  try {
    if (!mongoUri) {
      throw new Error('MONGODB_URI must be set in production.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
