require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const ip = require("request-ip");
const cookieMiddleware = require("./Middlewares/Cookie.middleware");

const logger = require("./lib/logger");
const initDB = require("./initDB");
const Routes = require("./Routes");
(async () => {
  const app = express();
  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB
  await initDB();

  app.use(ip.mw());
  app.use(cookieMiddleware);

  // Router Level Middlewares
  app.use("/api", Routes);

  //404 handler and pass to error handler
  app.use(() => {
    throw {
      status: 404,
      code: 404,
      message: "Not Found",
    };
  });

  //Error handler
  app.use((err, req, res, next) => {
    logger.debug(err.message || err);

    if (err.code === 11000) {
      err.message = "duplicate key error collection";
      err.statusCode = 400;
    }

    res.status(err.status || err.statusCode || 500).send({
      code: err.code || err.statusCode || 500,
      message: err.message || "Unhandling Error!",
      errorCode: err.errorCode,
    });
  });

  const PORT = process.env.PORT || 80;

  console.log("PORT: ", PORT);

  app.listen(PORT, () => {
    logger.debug("RESTful API server started on :" + PORT);
  });
})();
