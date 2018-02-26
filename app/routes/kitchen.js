var express = require('express');
var router = express.Router();


router.get('/', (req, res, next) => {
  res.send('you\'re in the kitchen api');
});

module.exports = router;