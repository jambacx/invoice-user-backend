const { getUsers, createUser, removeUser } = require("./redisClient");

const MAX_USER_COUNT = process.env.MAX_USER_COUNT || 5;

const checkUserLimit = async (sequence, data) => {
  const userCount = await getUsers();
  if (userCount >= MAX_USER_COUNT) {
    console.log("user limited");
    return false;
  } else {
    console.log("user created");
    createUser(sequence, data);
    return true;
  }
};

module.exports = {
  checkUserLimit
};
