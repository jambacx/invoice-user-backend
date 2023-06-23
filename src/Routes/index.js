const express = require("express");
const router = express.Router();
const moment = require("moment");
const { dateFormat } = require("../Constants/format");

router.get("/", (req, res) => {
  res.status(200).send({
    alive: true,
  });
});

router.get("/test", async (req, res, next) => {
  try {
    const Log = require("../Models/AccessLog.model");
    const date = moment().subtract(1, "day").format(dateFormat);
    const sum = await Log.accessByAuId(date);

    const logs = await Log.LogModel.find();

    res.send(logs);
  } catch (error) {
    next(error);
  }
});

router.use("/user", require("./User.route"));
router.use("/", require("./Invoice.route"));

module.exports = router;
