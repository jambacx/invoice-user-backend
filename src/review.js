const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const ip = require("request-ip");
const uuid = require("uuid").v4;
const { client } = require("./lib/redisClient");
const cookieMiddleware = require("./Middlewares/Cookie.middleware");
const sessionMiddleware = require("./Middlewares/session");

const logger = require("./lib/logger");
const Routes = require("./Routes");
require("dotenv").config();

(async () => {
  await client.connect();

  const app = express();

  app.use(morgan("dev"));
  app.use(cors({}));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      name: "sid",
      genid: () => {
        return uuid();
      },
      secret: "invoice_coookie_pwd",
      resave: true,
      saveUninitialized: true,
      cookie: {
        path: "/",
        secure: false,
        httpOnly: true,
        expires: 1 * 60 * 60 * 1000
      }
    })
  );

  app.use(ip.mw());
  app.use(sessionMiddleware, cookieMiddleware);

  app.use("/api", Routes);

  app.use(() => {
    throw {
      status: 404,
      code: 404,
      message: "Not Found"
    };
  });

  app.use((err, req, res, next) => {
    logger.debug(err.message || err);

    if (err.code === 11000) {
      err.message = "duplicate key error collection";
      err.statusCode = 400;
    }

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
