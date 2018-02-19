var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  
  /*
    TODO: Get food items from database
    TODO: res.render('index', { foodItems: <foodItems> });
  */
  res.render('index', {
    tables: [1,2,3,4,5,6,7,8,9,10]
  });
});

module.exports = router;
