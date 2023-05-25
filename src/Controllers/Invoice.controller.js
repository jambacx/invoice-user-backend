const ssh = require("../lib/ssh");
const Log = require("../Models/AccessLog.model");
const Invoice = require("../Models/Invoice.model");
const { Parser } = require("json2csv");
const invoices = require("../@fake-db/billing_month.json");

const getInvoices = (req, res) => {
  try {
    const { serviceId, systemAuId, startDate, endDate } = req.query;
    let filteredInvoices = invoices;

    if (serviceId) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.serviceId === serviceId
      );
    }

    if (systemAuId) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => invoice.systemAuId === systemAuId
      );
    }

    if (startDate || endDate) {
      filteredInvoices = filteredInvoices.filter((invoice) => {
        const issuedDate = new Date(invoice.issuedTime);
        const issuedYearMonth =
          issuedDate.getFullYear() * 100 + issuedDate.getMonth();

        if (startDate) {
          const startDateObj = new Date(startDate);
          const startYearMonth =
            startDateObj.getFullYear() * 100 + startDateObj.getMonth();
          if (startYearMonth > issuedYearMonth) {
            return false;
          }
        }

        if (endDate) {
          const endDateObj = new Date(endDate);
          const endYearMonth =
            endDateObj.getFullYear() * 100 + endDateObj.getMonth();
          if (endYearMonth < issuedYearMonth) {
            return false;
          }
        }

        return true;
      });
    }

    filteredInvoices.sort((a, b) => {
      const dateA = new Date(a.issuedTime);
      const dateB = new Date(b.issuedTime);

      // this will sort in descending order
      return dateB - dateA;
    });

    res.status(200).json(filteredInvoices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting invoices" });
  }
};

// POST /invoices
const postInvoice = async (req, res) => {
  try {
    const { year, month, billingData } = req.body;
    const invoice = new Invoice({ year, month, billingData });
    await invoice.save();
    res.status(201).json({ message: "Invoice created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating invoice" });
  }
};

// GET /invoices/pdf
const getInvoicePdf = async (req, res) => {
  try {
    const { year, month } = req.query;
    const invoice = await Invoice.findOne({ year, month });

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice PDF" });
  }
};

// GET /invoices/csv
const getInvoiceCsv = async (req, res) => {
  try {
    console.log("req: ");
    const { year, month } = req.query;
    const invoice = await Invoice.findOne({ year, month });

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    const parser = new Parser();
    const csv = parser.parse(invoice.billingData);
    res.setHeader("Content-Type", "text/csv");
    res.attachment(`invoice-${year}-${month}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice CSV" });
  }
};

module.exports = {
  getInvoices,
  getInvoicePdf,
  getInvoiceCsv,
  postInvoice
};
