const express = require("express");
const router = express.Router();

const controller = require("../Controllers/Invoice.controller");

router.get("/invoices", controller.getInvoices);

router.post("/invoices", controller.postInvoice);

router.post("/invoices/auth", controller.getAuth);

router.get("/invoices/pdf", controller.getInvoicePdf);

module.exports = router;
