var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('../modules/admin/admin.html');
});

module.exports = router;