const express = require("express");
const router = express.Router();
const controller = require("../Controllers/User.controller");
const { query } = require("express-validator");
const validator = require("../lib/validator");

router.get(
  "/",
  validator([
    query("type").exists().isIn(["m", "a", "t", "e"]),
    query("value").exists().notEmpty()
  ]),
  controller.find
);

// Run to following commands. (Cancel, ForceCancel and Rejoincon)
router.get(
  "/execute",
  validator([
    query("action").exists().isIn(["cancel", "forcecancel", "rejoincon"]),
    query("type").exists().isIn(["A", "M"]),
    query("value").exists().notEmpty()
  ]),
  controller.execute
);

module.exports = router;
