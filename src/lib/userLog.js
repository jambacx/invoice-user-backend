const logger = require("./logger");
const { userLogEntries } = require("../Constants/messageId");


function getLogEntry(messageId) {
  return userLogEntries.find((entry) => entry.messageId === messageId);
}

const getMessageId = (status, resultCode, reasonCode) => {
  let messageId;

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
      if (resultCode === "0" && reasonCode === "0") {
        messageId = "U000013";
      } else if (resultCode === "1" && reasonCode === "1") {
        messageId = "U000014";
      } else {
        messageId = "U000015";
      }
      break;

    default:
      messageId = "U000021";
  }

  return messageId;
};

function logAccess(
  transactionId,
  messageId,
  serviceId = "-",
  systemAuId = "-",
  result = "-"
) {
  const logEntryData = getLogEntry(messageId);

  if (!logEntryData) {
    logger.warn(`No log entry found for messageId: ${messageId}`);
    return;
  }

  const { request, level } = logEntryData;

  const logEntry = `${transactionId},${messageId},${serviceId},${systemAuId},${level},${request},${result}`;
  logger.info(logEntry);
}

module.exports = { logAccess, getMessageId };
