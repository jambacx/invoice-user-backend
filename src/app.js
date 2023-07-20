const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const ip = require("request-ip");
const cookieMiddleware = require("./Middlewares/Cookie.middleware");

const logger = require("./lib/logger");
const Routes = require("./Routes");
require("dotenv").config();

(async () => {
  const app = express();

  app.use(morgan("dev"));
  app.use(cors({}));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));

  app.use(ip.mw());
  app.use(cookieMiddleware);

  app.use("/api", Routes);

  app.use(() => {
    throw {
      status: 404,
      code: 404,
      message: "Not Found"
    };
  });

  //Error handler
  app.use((err, req, res, next) => {
    logger.debug(err.message || err);

    res.status(err.status || 500).send({
      code: err.code || 500,
      message: err.message || "Unhandling Error!"
    });
  });

  const PORT = process.env.PORT || 3030;

  console.log("PORT: ", PORT);

  app.listen(PORT, () => {
    logger.debug("RESTful API server started on :" + PORT);
  });
})();
