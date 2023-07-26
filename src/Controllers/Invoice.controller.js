const axios = require("axios");
const logger = require("../lib/logger");

const { checkUserLimit } = require("../lib/limitation");
const { removeUser } = require("../lib/redisClient");
const { log } = require("winston");

const baseURL = process.env.AIR_SERVER || "http://172.30.155.46:11080";
const headerHost = process.env.HOST_HEADER || "172.30.155.46";

const endpointPath = "/invoices";

const getInvoices = async (req, res) => {
  const startTime = new Date();
  logger.info(
    `[${startTime.toISOString()}] - 請求書の情報取得要求を受け取りました。パラメータ：${JSON.stringify(
      req.query
    )}`
  );

  try {
    const { serviceId, systemAuId, startDate, endDate } = req.query;

    const userKey = `${systemAuId}`;
    checkCustomerRequest(userKey, "", res);

    const response = await axios.get(`${baseURL}${endpointPath}`, {
      params: {
        serviceId,
        systemAuId,
        startDate,
        endDate
      },
      headers: {
        Host: headerHost,
        "Accept-Charset": "UTF-8"
      }
    });

    res.status(200).json({ data: response?.data, header: response?.headers });
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      res.status(500).json({ code: "003", message: "Request timeout" });
    } else {
      res.status(500).json({ message: "Error getting invoices" });
    }
  }
};

const getAuth = async (req, res) => {
  try {
    const { serviceId, courseId, authToken } = req.body;

    const magiUrl = "https://test-magi2.magi.auone.jp/vtkt/authorization2";

    const postData = `vtkt=${authToken}&sid=${serviceId}&cid=${courseId}`;

    const response = await axios.post(magiUrl, postData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=US-ASCII",
        Host: "test-magi2.magi.auone.jp",
        Connection: "close"
      }
    });

    if (response.status === 200) {
      const data = response.data.split("\n").reduce((prev, curr) => {
        const [key, value] = curr.split("=");
        prev[key] = value;
        return prev;
      }, {});

      res.json(data);
    } else {
      res.status(response.status).json({
        message: "Error from magi2.magi.auone.jp",
        status: response.status
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const checkCustomerRequest = async (sequence, data, res) => {
  const available = await checkUserLimit(sequence, data);

  if (!available) {
    return res
      .status(400)
      .json({ errorCode: 403, message: "User access is denied." });
  }
};

const logout = (req, res) => {
  const { systemAuId } = req.body;

  if (!systemAuId) {
    return next;
  }

  removeUser(systemAuId);
};

const postInvoice = async (req, res) => {
  try {
    const { serviceId, systemAuId, invoiceList } = req.body;

    const userKey = `${systemAuId}`;
    checkCustomerRequest(userKey, "", res);

    if (
      typeof serviceId === "undefined" ||
      typeof systemAuId === "undefined" ||
      !Array.isArray(invoiceList)
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const response = await axios.post(
      `${baseURL}${endpointPath}`,
      {
        serviceId,
        systemAuId,
        invoiceList
      },
      {
        headers: {
          Host: headerHost,
          "Accept-Charset": "UTF-8",
          "Content-Type": "application/json; charset=UTF-8"
        },
        timeout: 60000
      }
    );

    if (response?.status === 200) {
      logger.info("請求書の送信に成功しました");

      return res
        .status(201)
        .json({ data: response?.data, header: response?.headers });
    } else {
      logger.error("外部サービスからのエラー");

      return res.status(500).json({
        message: "Error from external service"
      });
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      res.status(500).json({ code: "003", message: "Request timeout" });
    } else {
      res.status(500).json({ message: "Error getting invoice" });
    }
  }
};

const getInvoicePdf = async (req, res) => {
  try {
    const { serviceId, systemAuId, invoiceId } = req.query;

    const userKey = `${systemAuId}`;
    checkCustomerRequest(userKey, "", res);
    if (!serviceId || !systemAuId || !invoiceId || isNaN(invoiceId)) {
      return res.status(400).json({
        header: {
          reasoncode: 1,
          message: "Invalid request parameters"
        }
      });
    }

    const response = await axios.get(`${baseURL}/invoices/pdf`, {
      params: {
        serviceId,
        systemAuId,
        invoiceId,
        limit: 500
      },
      headers: {
        Host: headerHost,
        "Accept-Charset": "UTF-8"
      },
      responseType: "stream",
      timeout: 60000
    });

    if (response.status === 200) {
      console.log(response.headers);
      res.setHeader("Content-Type", response.headers["content-type"]);
      res.setHeader("x-resultcode", response.headers["x-resultcode"]);

      response.data.pipe(res);
    } else {
      logger.error("外部サービスからのエラー");

      return res.status(500).json({
        header: {
          reasoncode: 1,
          message: "Error from external service"
        }
      });
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      res.status(500).json({ code: "003", message: "Request timeout" });
    } else {
      res.status(500).json({ message: "Error getting invoices" });
    }
  }
};

module.exports = {
  getInvoices,
  getInvoicePdf,
  getAuth,
  postInvoice,
  logout
};
