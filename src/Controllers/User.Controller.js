const createError = require('http-errors');
const mongoose = require('mongoose');
const logger = require('../lib/logger');
const ssh = require('../lib/ssh');

// const User = require('../Models/User.model');

const findUserById = async (req, res, next) => {
  const id = req.params.id;
  const type = req.query.searchType;

  logger.info(`****findByuserId*****: searchType: ${type} searchValue: ${id}`);

  try {
    if (type === 'email') {
      // const userList = await User.find({ contract_email_address: id });
      // console.log('userList: ', userList);
      // res.send(userList);
      const conn = await ssh.connect();
      const response = await ssh.execCommand('/opt/aumpsw/kddi/bin/portability_customer_ctrl_wrapper.sh show m portability_test101@au.com | iconv -f sjis -t utf-8');

      if (response.stderr) {
        throw new Error(response.stderr);
      }
      res.send(response);
      // ssh
      //   .connect({
      //     host: "10.64.10.227",
      //     username: "root",
      //     password: "Password1",
      //   })
      //   .then(() => {
      //     console.log("connected");
      //     ssh
      //       .execCommand("show m " + id, {
      //         sh: "/opt/api/config/portability_customer_ctrl_wrapper.sh",
      //       })
      //       .then((result) => {
      //         console.log("console log termminal: ", result);
      //         logger.info("result terminal command", result);
      //       });
      //   });
    }
  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};

module.exports = {
  findUserById
};
