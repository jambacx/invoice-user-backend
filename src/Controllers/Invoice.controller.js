const axios = require("axios");
const logger = require("../lib/logger");
const qs = require("qs");

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

    res.status(200).json(response?.data);
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

const postInvoice = async (req, res) => {
  try {
    const { serviceId, systemAuId, invoiceList } = req.body;

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

      return res.status(201).json(response?.data);
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

    // Validate input parameters
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
      logger.info("請求書のPDF生成に成功しました");

      res.setHeader("Content-Type", response.headers["content-type"]);

      if (response.headers["content-disposition"]) {
        res.setHeader(
          "Content-Disposition",
          response.headers["content-disposition"]
        );
      }

      // Pipe the stream to the client
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
  postInvoice
};
