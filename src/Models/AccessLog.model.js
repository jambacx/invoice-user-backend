const mongoose = require('mongoose');
const moment = require('moment');
const { dateFormat } = require('../Constants/format');
const logger = require('../lib/logger');

const LogSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    default: moment().format(dateFormat)
  },
  operatorId: {
    type: String,
    default: null
  },
  auId: {
    type: String,
    default: null
  },
  commandType: {
    type: String,
    required: true,
  },
  commandDetail: {
    type: String,
    required: true,
  },
}, { collection: 'accessLogs', timestamps: true });

const LogModel = mongoose.model('AccessLog', LogSchema);

const accessByCommand = async (date) => {
  const rows = await LogModel.aggregate([
    { $match: { date: { $eq: date } } },
    { $group: { _id: "$commandType", value: { $sum: 1 } } },
  ]);

  let log = {
    show: 0,
    cancel: 0,
    forcecancel: 0,
    rejoincon: 0,
    total: 0
  };
  for (let rec of rows) {
    log[rec._id] = rec.value;
    log.total += rec.value;
  }

  return log;
};

const accessByOperator = async (date) => {
  const rows = await LogModel.aggregate([
    { $match: { date: { $eq: date } } },
    { $group: { _id: '$operatorId', value: { $sum: 1 } } },
  ]);

  let log = {
    with: 0,
    without: 0
  };

  for (let rec of rows) {
    if (rec._id) {
      log.with += 1;
    } else {
      log.without = rec.value;
    }
  }

  return log;
};

const accessByAuId = async (date) => {
  const rows = await LogModel.aggregate([
    { $match: { date: { $eq: date } } },
    { $group: { _id: '$auId', value: { $sum: 1 } } },
  ]);

  let log = {
    with: 0,
    without: 0
  };

  for (let rec of rows) {
    if (rec._id) {
      log.with += 1;
    } else {
      log.without = rec.value;
    }
  }

  return log;
};

const create = async (data) => {
  try {
    const log = new LogModel(data);
    return await log.save();
  } catch (error) {
    logger.debug(error.message || error);
  }
};

module.exports = {
  LogModel,
  create,
  accessByCommand,
  accessByOperator,
  accessByAuId
};
