const express = require('express');
const config = require('../config');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.redirect(config.clientUrl);
});

module.exports = router;
