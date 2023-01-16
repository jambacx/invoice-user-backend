const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const filename = path.resolve(`${process.env.logFolder || 'logs'}`, 'log_%DATE%.log');

const transport = new DailyRotateFile({
  filename,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  prepend: true,
  level: 'info',
});
// transport.on('rotate', function (oldFilename, newFilename) {
//   // call function like upload to s3 or on cloud
// });

const logger = winston.createLogger({
  format: logFormat,
  transports: [
    transport,
    new winston.transports.Console({
      level: 'info',
    }),
  ],
});

module.exports = logger;
