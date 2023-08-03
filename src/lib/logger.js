require("winston-daily-rotate-file");
const winston = require("winston");
const { accessLogDir } = require("../Constants/dir");

const fileTransport = new winston.transports.DailyRotateFile({
  filename: "%DATE%.log",
  dirname: accessLogDir,
  datePattern: "YYYYMMDD",
  // zippedArchive: true,
  // maxSize: '20m',
  // maxFiles: '14d',
  prepend: true,
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD,HH:mm:ss" }),
    winston.format.printf((info) => `${info.timestamp},${info.message}`)
  )
});

const consoleTransport = new winston.transports.Console({
  level: "debug",
  timestamp: false,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

const logger = winston.createLogger({
  transports: [fileTransport, consoleTransport]
});

module.exports = logger;
