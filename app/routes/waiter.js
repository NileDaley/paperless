var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('you\'re in the waiter api');
});

module.exports = router;
