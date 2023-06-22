const logger = require("./logger");
const parser = require("./parser");
const errorHandler = require("./error");
const { NodeSSH } = require("node-ssh");

const ssh = new NodeSSH();

const servers = {
  osaka: {
    host: process.env.AIR_OSAKA_HOST,
    username: process.env.AIR_OSAKA_USERNAME,
    password: process.env.AIR_OSAKA_PASSWORD
  },
  oyama: {
    host: process.env.AIR_OYAMA_HOST,
    username: process.env.AIR_OYAMA_USERNAME,
    password: process.env.AIR_OYAMA_PASSWORD
  }
};

const connect = async (server = servers.osaka) => {
  return await ssh.connect({
    host: server,
    username: server.username,
    password: server.password,
    port: 11080,
    readyTimeout: process.env.SESSION_TIME
  });
};

const execCommand = async (options, count = 1) => {
  const req = options.req;
  const command = `${options.action} ${options.type} ${options.value} | iconv -f sjis -t utf-8`;
  const response = await ssh.execCommand(
    `${process.env.SSH_DOTSH_FILE} ${command}`
  );

  if (response.stderr) {
    logger.info(
      `E,${req.operatorId},${req.clientIp},${translateToJapan(
        options.action
      )},${options.value},${respCode}`
    );
    throw new Error(response.stderr);
  }

  const parsed = await parser(response.stdout);
  const respCode = parsed["処理結果コード"];

  logger.info(
    `I,${req.operatorId},${req.clientIp},${translateToJapan(options.action)},${
      options.value
    },${respCode}`
  );

  if (respCode === "1106" && count === 1) {
    await connect(servers.oyama);
    return await execCommand(command, 2);
  }

  await errorHandler(respCode);
  return parsed;
};

const translateToJapan = (text) => {
  return text
    .replace("show", "検索")
    .replace("cancel", "解約実行")
    .replace("forcecancel", "強制解約実行")
    .replace("rejoincon", "強制解約解除実行");
};

module.exports = {
  connect,
  execCommand
};
