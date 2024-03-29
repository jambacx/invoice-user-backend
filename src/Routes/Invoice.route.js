const express = require("express");
const router = express.Router();

const controller = require("../Controllers/Invoice.controller");

router.get("/invoices", controller.getInvoices);

router.post("/invoices", controller.postInvoice);

router.post("/invoices/auth", controller.getAuth);

router.post("/invoices/logout", controller.logout);

router.get("/invoices/logger", controller.uiLogger);

router.get("/invoices/pdf", controller.getInvoicePdf);

module.exports = router;
