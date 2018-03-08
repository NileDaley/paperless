var express = require('express');
const mongoose = require('mongoose');
var router = express.Router();
let FoodItemSchema = require('../schemas/FoodItemSchema');

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('../modules/admin/admin.html');
});

router.post('/new-item', (req, res, next) => {
  let itemToSave = req.body;
  let FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  FoodItem.create(itemToSave, (err,data) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Should have created");
      res.json(data);
    }
  })
})
module.exports = router;