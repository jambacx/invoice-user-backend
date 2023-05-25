const ssh = require("../lib/ssh");
const Log = require("../Models/AccessLog.model");
const parser = require("../lib/parser");

const find = async (req, res, next) => {
  try {
    const type = req.query.type;
    const value = req.query.value;
    const action = "show";

    await Log.create({
      operatorId: req.operatorId,
      auId: req.auId,
      commandType: action,
      commandDetail: value
    });

    await ssh.connect();

    const response = await ssh.execCommand({
      action,
      type,
      value,
      req
    });

    return res.send(response);
  } catch (error) {
    next(error);
  }
};

const execute = async (req, res, next) => {
  try {
    const action = req.query.action;
    const type = req.query.type;
    const value = req.query.value;

    await Log.create({
      operatorId: req.operatorId,
      auId: req.auId,
      commandType: action,
      commandDetail: value
    });

    await ssh.connect();

    const response = await ssh.execCommand({
      action,
      type,
      value,
      req
    });
    return res.send(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  find,
  execute
};
