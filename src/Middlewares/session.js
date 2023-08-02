module.exports = (req, res, next) => {
  req.sessionCount = Object.keys(req.sessionStore.sessions).length;
  next();
};
