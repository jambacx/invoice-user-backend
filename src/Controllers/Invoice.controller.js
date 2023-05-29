const { Parser } = require("json2csv");
const invoices = require("../@fake-db/billing_month.json");
const listInvoice = require("../@fake-db/invoicing_list.json");
const listCsv = require("../@fake-db/request_csv.json");
const PDFDocument = require("pdfkit");
const { createObjectCsvStringifier } = require("csv-writer");
const fs = require("fs");
const { faker } = require("@faker-js/faker");

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

const postInvoice = async (req, res) => {
  try {
    const { invoiceList } = req.body;
    let filteredInvoices = invoiceList.map((reqInvoice) => {
      return listInvoice.find(
        (invoice) =>
          invoice.billingYear === reqInvoice.billingYear &&
          invoice.billingMonth === reqInvoice.billingMonth
      );
    });

    filteredInvoices = filteredInvoices.map((invoice, index) => {
      console.log("invoice: ", invoice);
      if (!invoice) {
        return {
          invoiceId: null,
          billingYear: invoiceList[index].billingYear,
          billingMonth: invoiceList[index].billingMonth,
          issuedTime: null
        };
      }
      return invoice;
    });

    res.status(201).json({
      header: {
        reasoncode: 0,
        message: "success"
      },
      body: {
        invoiceList: filteredInvoices
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating invoice" });
  }
};

const getInvoicePdf = async (req, res) => {
  try {
    const { invoiceId } = req.query;
    const invoiceIdNumber = parseInt(invoiceId, 10);

    const invoice = invoices.find(
      (invoice) => invoiceIdNumber === invoice.invoiceId
    );

    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    const doc = new PDFDocument();
    doc.pipe(res);
    doc
      .fontSize(25)
      .text(`Invoice ID: ${invoice.invoiceId}`, 50, 50)
      .moveDown()
      .fontSize(20)
      .text(`Billing Year: ${invoice.billingYear}`)
      .moveDown()
      .text(`Billing Month: ${invoice.billingMonth}`)
      .moveDown()
      .text(`Issued Time: ${invoice.issuedTime}`);
    doc.end();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice_${invoice.invoiceId}.pdf"`
    );
  } catch (error) {
    res.status(500).json({ message: "Error generating invoice PDF" });
  }
};

const getInvoiceCsv = async (req, res) => {
  try {
    const { systemAuId, startDate, endDate, businessName } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const invoices = listCsv.filter((invoice) => {
      const salesDate = new Date(invoice.salesConfirmationDate);
      return (
        invoice.systemAuId === systemAuId &&
        salesDate >= start &&
        salesDate <= end &&
        invoice.customerName === businessName
      );
    });

    const faker = new Faker();

    const generateRandomData = (count) => {
      const data = [];
      for (let i = 0; i < count; i++) {
        const invoice = {
          invoiceNo: faker
            .randomNumber({ min: 1000000000, max: 9999999999 })
            .toString(),
          settlementInfoNo: faker
            .randomNumber({ min: 1000000000, max: 9999999999 })
            .toString(),
          systemAuId: faker.randomNumber({ min: 1000, max: 9999 }).toString(),
          customerName: faker.company.companyName(),
          salesConfirmationDate: faker.date
            .between("2023-04-01", "2023-06-30")
            .toLocaleDateString(),
          amountExcludingTax: faker.randomNumber({ min: 1, max: 100 }),
          amountIncludingTax: faker.randomNumber({ min: 1, max: 100 }),
          webPublicationStatus: faker.randomNumber({ min: 0, max: 1 }),
          firstWebPublicationDate: "",
          updateFlag: faker.randomNumber({ min: 0, max: 1 }),
          updateDate: faker.date.past().toLocaleDateString(),
          previousAmountIncludingTax: faker.randomNumber({ min: 1, max: 100 })
        };
        data.push(invoice);
      }
      return data;
    };

    const randomData = generateRandomData(12000);
    const jsonData = JSON.stringify(randomData, null, 2);

    fs.writeFileSync("randomData.json", jsonData);

    if (invoices.length === 0) {
      return res
        .status(404)
        .json({ message: "No invoices found for the specified parameters" });
    }

    const csvData = invoices.map((invoice) => ({
      "請求書NO.": invoice.invoiceNo,
      決済情報番号: invoice.settlementInfoNo,
      システムauID: invoice.systemAuId,
      顧客氏名: invoice.customerName,
      売上確定年月日: invoice.salesConfirmationDate,
      "金額（税抜）": invoice.amountExcludingTax,
      "金額（税込）": invoice.amountIncludingTax,
      WEB発行有無: invoice.webPublicationStatus,
      WEB初回発行日時: invoice.firstWebPublicationDate,
      更新フラグ: invoice.updateFlag,
      更新日: invoice.updateDate,
      "更新前金額（税込）": invoice.previousAmountIncludingTax
    }));

    const csv = csvStringifier.stringifyRecords(csvData);
    const csvWithBom = "\uFEFF" + csv;
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.status(200).send(csvWithBom);
  } catch (error) {
    console.error("Error generating invoice CSV", error);
    res.status(500).json({ message: "Error generating invoice CSV" });
  }
};

module.exports = {
  getInvoices,
  getInvoicePdf,
  getInvoiceCsv,
  postInvoice
};
