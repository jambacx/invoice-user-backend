const express = require('express');
const router = express.Router();
const controller = require("../Controllers/Archive.controller.js");

// Last day log will be archived
router.get('/daily', controller.daily);

// Last month logs will be archived
router.get('/monthly', controller.monthly);

// Last year logs will be archived
router.get('/yearly', controller.yearly);

module.exports = router;
