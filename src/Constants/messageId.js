const userLogEntries = [
  { messageId: "U000001", request: "request of app start", level: "I" },
  { messageId: "U000002", request: "request of app start", level: "E" },
  { messageId: "U000003", request: "request of auID login", level: "I" },
  { messageId: "U000004", request: "request of auID login", level: "E" },
  { messageId: "U000005", request: "request of Magi", level: "I" },
  { messageId: "U000006", request: "request of Magi", level: "E" },
  { messageId: "U000007", request: "request of get month list", level: "I" },
  { messageId: "U000008", request: "request of get month list", level: "I" },
  { messageId: "U000009", request: "request of get month list", level: "E" },
  {
    messageId: "U000010",
    request:
      "year of user' select from dropdown menu\nForExam: 2023 year or last one year",
    level: "I"
  },
  { messageId: "U000011", request: "request of POST /invoices...", level: "I" },
  { messageId: "U000012", request: "request of POST /invoices...", level: "E" },
  {
    messageId: "U000013",
    request: "request of GET /invoices/pdf...",
    level: "I"
  },
  {
    messageId: "U000014",
    request: "request of GET /invoices/pdf...",
    level: "I"
  },
  {
    messageId: "U000015",
    request: "request of GET /invoices/pdf...",
    level: "W"
  },
  {
    messageId: "U000016",
    request: "request of transtion to auID member information",
    level: "I"
  },
  {
    messageId: "U000017",
    request: "request of transition to inquiry",
    level: "I"
  },
  { messageId: "U000018", request: "request of logout", level: "I" },
  { messageId: "U000019", request: "-", level: "W" },
  { messageId: "U000020", request: "request of auID login", level: "E" }
];

module.exports = {
  userLogEntries
};
