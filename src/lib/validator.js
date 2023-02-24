const { validationResult } = require('express-validator');

module.exports = (...validations) => {
  return [...validations, (req, res, next) => {
    if (validationResult(req).isEmpty()) {
      return next();
    }

    next(new Error("Invalid parameters"));
  }];
};