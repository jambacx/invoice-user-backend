const express = require("express");
const router = express.Router();

const controller = require("../Controllers/Invoice.controller");

router.get("/invoices", controller.getInvoices);

router.post("/invoices", controller.postInvoice);

router.get("/invoices/pdf", controller.getInvoicePdf);

router.get("/invoices/csv", controller.getInvoiceCsv);

module.exports = router;
