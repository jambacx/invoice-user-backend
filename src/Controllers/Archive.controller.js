const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
var glob = require("glob");

const respCode = Object.freeze({
  archived: 'A',
  unArchived: 'UA',
  error: 'E'
});

const logDir = process.env.access_log_dir;

const daily = (req, res, next) => {
  try {
    const filename = moment().subtract('1', 'day').format('YYYYMMDD');
    const logName = filename + '.log';
    const zipName = filename + '.tar.gz';

    if (fs.existsSync(path.join(logDir, logName))) {
      childProcess.execSync(`tar -czvf ${zipName} ${logName}`, {
        cwd: logDir
      });

      childProcess.execSync(`rm -f ${logName}`, {
        cwd: logDir
      });

      return res.send(respCode.archived);
    }

    return res.send(respCode.unArchived);
  } catch (error) {
    res.send(respCode.error);
  }
};

const monthly = (req, res, next) => {
  try {
    const filename = moment().subtract('1', 'month').format('YYYYMM');
    const logName = filename + '*.tar.gz';
    const zipName = filename + '.tar.gz';

    const files = glob.sync(logName, {
      cwd: logDir
    });

    if (files.length > 0) {
      childProcess.execSync(`tar -czvf ${zipName} ${logName}`, {
        cwd: logDir
      });

      childProcess.execSync(`rm -f ${logName}`, {
        cwd: logDir
      });

      return res.send(respCode.archived);
    }

    return res.send(respCode.unArchived);
  } catch (error) {
    res.send(respCode.error);
  }
};

const yearly = (req, res, next) => {
  try {
    const filename = moment().subtract('1', 'year').format('YYYY');
    const logName = filename + '*.tar.gz';
    const zipName = filename + '.tar.gz';

    const files = glob.sync(logName, {
      cwd: logDir
    });

    if (files.length > 0) {
      childProcess.execSync(`tar -czvf ${zipName} ${logName}`, {
        cwd: logDir
      });

      childProcess.execSync(`rm -f ${logName}`, {
        cwd: logDir
      });

      return res.send(respCode.archived);
    }

    return res.send(respCode.unArchived);
  } catch (error) {
    res.send(respCode.error);
  }
};

module.exports = {
  daily,
  monthly,
  yearly
};