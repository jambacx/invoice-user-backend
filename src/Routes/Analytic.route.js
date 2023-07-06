const express = require("express");
const router = express.Router();
const controller = require("../Controllers/Analytic.controller.js");

// Last day access logs will be generated
router.get("/daily", controller.daily);

module.exports = router;
