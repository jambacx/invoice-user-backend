const logger = require("./logger");
const { userLogEntries } = require("../Constants/messageId");
const moment = require("moment");

function getLogEntry(messageId) {
  return userLogEntries.find((entry) => entry.messageId === messageId);
}

const getMessageId = (status, resultCode, reasonCode) => {
  let messageId;

  if (typeof resultCode !== "string") {
    resultCode = resultCode.toString();
  }

  if (typeof reasonCode !== "string") {
    reasonCode = reasonCode.toString();
  }

  switch (status) {
    case 1:
      if (resultCode === "0" && reasonCode === "0") {
        messageId = "U000007";
      } else if (resultCode === "1") {
        messageId = "U000008";
      } else {
        messageId = "U000009";
      }
      break;
    case 2:
      if (resultCode === "0" && reasonCode === "0") {
        messageId = "U000011";
      } else {
        messageId = "U000012";
      }
      break;
    case 3:
      if (resultCode === "0" && reasonCode === "-") {
        messageId = "U000013";
      } else if (resultCode === "1" && reasonCode === "1") {
        messageId = "U000014";
      } else {
        messageId = "U000015";
      }
      break;
    case 4:
      if (resultCode === "0" && reasonCode === "1") {
        messageId = "U000003";
      } else if (resultCode === "0" && reasonCode === "0") {
        messageId = "U000004";
      } else if (resultCode === "1" && reasonCode === "1") {
        messageId = "U000005";
      }
      else {
        messageId = "U000006";
      }
      break;
    default:
      messageId = "U000027";
  }

  return messageId;
};

function logAccess(
  transactionId,
  messageId,
  serviceId = "-",
  systemAuId = "-",
  result = "-",
  startTime = null
) {
  const logEntryData = getLogEntry(messageId);

  if (!logEntryData) {
    logger.warn(`No log entry found for messageId: ${messageId}`);
    return;
  }

  const responseTimeMessageIds = new Set([
    "U000003",
    "U000004",
    "U000005",
    "U000006",
    "U000007",
    "U000008",
    "U000009",
    "U000010",
    "U000011",
    "U000012",
    "U000013",
    "U000014",
    "U000015",
    "U000016",
    "U000018",
    "U000019"
  ]);

  let responseTime = "-";
  if (responseTimeMessageIds.has(messageId) && startTime) {
    const endTime = moment();
    const duration = moment.duration(endTime.diff(moment(startTime)));
    responseTime = `${duration.hours().toString().padStart(2, "0")}:${duration
      .minutes()
      .toString()
      .padStart(2, "0")}:${duration
      .seconds()
      .toString()
      .padStart(2, "0")}.${duration
      .milliseconds()
      .toString()
      .padStart(3, "0")}`;
  }

  const { request, level } = logEntryData;

  const logEntry = `${transactionId},${messageId},${serviceId},${systemAuId},${level},${request},${result},${responseTime}`;
  logger.info(logEntry);
}

module.exports = { logAccess, getMessageId };
