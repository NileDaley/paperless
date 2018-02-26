var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let moment = require('moment');
let FoodItemSchema = require('../schemas/FoodItemSchema');
let OrderLineSchema = require('../schemas/OrderLineSchema');
let OrderSchema = require('../schemas/OrderSchema');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', {});
});

router.post('/', (req, res, next) => {

  let { table, order, customers } = req.body;
  let FoodItem = mongoose.model('FoodItem', FoodItemSchema);
  let OrderLine = mongoose.model('OrderLine', OrderLineSchema);
  let Order = mongoose.model('Order', OrderSchema);
  
  let newOrder = new Order({
    table,
    date: moment().format('YYYY-MM-DD HH:MM:SS'),
    customers,
    items: order.map(line => {
      return {
        quantity: line.quantity,
        item: mongoose.Types.ObjectId(line.item._id)
      }
    })
  });

  newOrder.save()
    .then(response => {
      res.statusCode = 201;
      res.json(response);
    })
    .catch(err => {
      res.statusCode = 500;
      res.json(err);
    });
  
});

module.exports = router;
