const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FoodItemSchema = require('../schemas/FoodItemSchema');
const FoodItem = mongoose.model('FoodItem', FoodItemSchema);

router.get('/', (req, res, next) => {
  FoodItem
    .find()
    .then(data => {
      res.json(data);
    })
    .catch(err => res.send(err));
});

router.get('/:id', (req, res, next) => {
  FoodItem
    .findById(req.params.id)
    .then(data => res.json(data))
    .catch(err => res.send(err));
});

module.exports = router;