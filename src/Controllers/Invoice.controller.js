const { Parser } = require("json2csv");
const invoices = require("../@fake-db/billing_month.json");
const listInvoice = require("../@fake-db/invoicing_list.json");
const listCsv = require("../@fake-db/request_csv.json");
const PDFDocument = require("pdfkit");
const { createObjectCsvStringifier } = require("csv-writer");
const fs = require("fs");
const axios = require("axios");
const ssh = require("../lib/ssh");

const INVOICE_FIELDS = [
  "請求書NO.",
  "決済情報番号",
  "システムauID",
  "顧客氏名",
  "売上確定年月日",
  "金額（税抜）",
  "金額（税込）",
  "WEB発行有無",
  "WEB初回発行日時",
  "更新フラグ",
  "更新日",
  "更新前金額（税込）"
];

const csvStringifier = createObjectCsvStringifier({
  header: INVOICE_FIELDS.map((field) => ({ id: field, title: field })),
  alwaysQuote: true
});

const baseURL = process.env.AIR_SERVER || "http://172.30.155.46:11080";
const headerHost = process.env.HOST_HEADER || "172.30.155.46";

const endpointPath = "/invoices";

const getInvoices = async (req, res) => {
  const startTime = new Date();
  console.log(
    `[${startTime.toISOString()}] - Incoming request to get invoices with parameters: `,
    req.query
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

    const endTime = new Date();

    console.log(
      `[${endTime.toISOString()}] - Successfully fetched invoices. Response time: ${
        endTime - startTime
      }ms`
    );

    res.status(200).json(response?.data);
  } catch (error) {
    const endTime = new Date();

    console.error(`Response time: ${endTime - startTime}ms`);
    console.error("error: ", error);
    res.status(500).json({ message: "Error getting invoices" });
  }
};

const postInvoice = async (req, res) => {
  try {
    const { serviceId, systemAuId, invoiceList } = req.body;

    // Validate the request data
    if (
      typeof serviceId === "undefined" ||
      typeof systemAuId === "undefined" ||
      !Array.isArray(invoiceList)
    ) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Make a POST request to the external service
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
        }
      }
    );

    if (response?.status === 200) {
      return res.status(201).json(response?.data);
    } else {
      return res.status(500).json({
        message: "Error from external service"
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error checking invoice" });
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

    // Make a GET request to the external service
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
      responseType: "stream"
    });

    // Forward the response from the external service to the client
    if (response.status === 200) {
      res.setHeader("Content-Type", response.headers["content-type"]);

      // Forward content-disposition headers if present
      if (response.headers["content-disposition"]) {
        res.setHeader(
          "Content-Disposition",
          response.headers["content-disposition"]
        );
      }

      // Pipe the stream to the client
      response.data.pipe(res);
    } else {
      return res.status(500).json({
        header: {
          reasoncode: 1,
          message: "Error from external service"
        }
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      header: {
        reasoncode: 1,
        message: "Error generating invoice PDF"
      }
    });
  }
};



module.exports = {
  getInvoices,
  getInvoicePdf,
  getInvoiceCsv,
  postInvoice
};
