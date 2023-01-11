require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const logger = require('./lib/logger');
var cors = require('cors');

const Router = require("./Routes/All.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB
// require("./initDB")();

app.use("/api/v1", Router);

//404 handler and pass to error handler
app.use((req, res, next) => {
  next(createError(404, 'Not found'));
});

//Error handler
app.use((err, req, res, next) => {
  // next(createError(500, err.message || 'Unhandling Error!'));
  res
    .status(err.status || 500)
    .send({
      status: err.status || 500,
      message: err.message || 'Unhandling Error!',
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info('RESTful API server started on :' + PORT);
});
