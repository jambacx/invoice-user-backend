const fs = require("fs");
const path = require("path");
const moment = require("moment");
const logger = require("../lib/logger");
const { analyticLogDir } = require("../Constants/dir");
const { dateFormat } = require("../Constants/format");
const Log = require("../Models/AccessLog.model");

const logName = "accessAnalyticsLog.log";
const logPath = path.join(analyticLogDir, logName);

const daily = async (req, res, next) => {
  try {
    if (!fs.existsSync(analyticLogDir)) {
      fs.mkdirSync(analyticLogDir);
    }

    if (!fs.existsSync(logPath)) {
      fs.writeFileSync(
        logPath,
        "日付,セッション数,照会数,解約数,強制解約数,強制解約解除数,オペレーターID数,auIDありのアクセス数,auIDなしのアクセス数\n"
      );
    }

    const date = moment().subtract(1, "day").format(dateFormat);
    const accessCommand = await Log.accessByCommand(date);
    const accessOperator = await Log.accessByOperator(date);
    const accessAuId = await Log.accessByAuId(date);

    const logString = `${date},${accessCommand.total},${accessCommand.show},${accessCommand.cancel},${accessCommand.forcecancel},${accessCommand.rejoincon},${accessOperator.with},${accessAuId.with},${accessAuId.without}\n`;
    fs.appendFileSync(logPath, logString);

    res.send("ok");
  } catch (error) {
    logger.debug(error.message || error);
  }
};

module.exports = {
  daily
};
