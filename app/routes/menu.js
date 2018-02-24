var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const FoodItemSchema = require('../schemas/FoodItemSchema');

mongoose.connect('mongodb://admin:password@ds247078.mlab.com:47078/paperless');
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Connected to mongodb via mongoose..."));

router.get('/', function (req, res, next) {
  let FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  FoodItem
    .find()
    .then(data => {
      res.json(data);
    })
    .catch(err => res.send(err));
});

module.exports = router;