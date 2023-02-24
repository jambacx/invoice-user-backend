const mongoose = require('mongoose');
const logger = require('./lib/logger');

module.exports = async () => {
  mongoose.connection.on('connected', () => {
    logger.debug('Mongoose connected to db...');
  });

  mongoose.connection.on('error', err => {
    logger.debug(err.message || err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.debug('Mongoose connection is disconnected...');
  });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.debug('Mongoose connection is disconnected due to app termination...');
      process.exit(0);
    });
  });

  return await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};
