const jwt = require("jsonwebtoken");
const CustomError = require("../lib/customError");

exports.checkAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new CustomError("Please login first", 401);
    }
    const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = tokenObj.id;
    req.userRole = tokenObj.role;
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.userRole)) {
        throw new CustomError("Your role is wrong", 403);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
