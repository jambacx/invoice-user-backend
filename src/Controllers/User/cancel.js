const mongoose = require('mongoose');
const logger = require('../../lib/logger');
const ssh = require('../../lib/ssh');

const find = async (req, res, next) => {
  const id = req.query.value;
  const type = req.query.type;

  logger.info(`****Cancel*****: Type: ${type} Value: ${id}`);

  try {
    

    throw new Error('Undefined call');
  } catch (error) {
    next(error);
  }
};

module.exports = find;
