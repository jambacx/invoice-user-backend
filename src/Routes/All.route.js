const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res
    .status(200)
    .send({
      alive: true
    });
});

router.use('/user', require('./User.route'));

module.exports = router;