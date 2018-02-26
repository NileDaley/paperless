var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const FoodItemSchema = require('../schemas/FoodItemSchema');

router.get('/', function (req, res, next) {
  let FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  FoodItem
    .find()
    .then(data => {
      res.json(data);
    })
    .catch(err => res.send(err));
});

//  ATTEMPTING TO REMOVE ONE ITEM - NOT WHOLE DB
// router.delete('/', function (req, res) {
//   let itemToRemove = req.body;
//   let FoodItem = mongoose.model('FoodItem', FoodItemSchema);
//   FoodItem
//     .find(itemToRemove)
//     .remove(itemToRemove, err => {
//       if (err) return handleError(err);
//     })
// })

module.exports = router;