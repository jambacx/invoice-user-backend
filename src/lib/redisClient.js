const redis = require("redis");

let redisPort = 6379;
let redisHost = "localhost";

const MINUTES_IN_MS = 5 * 60;

const client = redis.createClient({
  socket: {
    port: redisPort,
    host: redisHost
  }
});

client
  .on("connect", function () {
    console.log("redis connected");
  })
  .on("error", function (error) {
    console.log(error);
  });

const getUsers = async () => {
  const keys = await client.keys("*");
  return keys.length;
};

const removeUser = async (key) => {
  await client.del(key);
};

const createUser = async (key, value) => {
  await client.set(key, value, { EX: MINUTES_IN_MS });
};

module.exports = { client, createUser, getUsers, removeUser };
