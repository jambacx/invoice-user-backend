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
    "T000003",
    "T000004",
    "T000005",
    "T000006",
    "T000007",
    "T000008",
    "T000009",
    "T000010",
    "T000011",
    "T000012",
    "T000013",
    "T000014",
    "T000015",
    "T000016",
    "T000018",
    "T000019"
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
