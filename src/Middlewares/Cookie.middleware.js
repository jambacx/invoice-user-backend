module.exports = (req, res, next) => {
  if (req.cookies['operatorId']) {
    req.operatorId = req.cookies.operatorId;
  }
  if (req.cookies['auId']) {
    req.auId = req.cookies.auId;
  }

  next();
};