const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const OrderSchema = require('../schemas/OrderSchema');
const OrderLineSchema = require('../schemas/OrderLineSchema');
const FoodItemSchema = require('../schemas/FoodItemSchema');

const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
const OrderLine = mongoose.model('OrderLine', OrderLineSchema);
const Order = mongoose.model('Order', OrderSchema);

/* GET users listing. */
// TODO: Populate items and items.item
router.get('/all-orders', (req, res, next) => {
  Order
    .find()
    .then(data => {
      res.json(data);
    })
    .catch(err => res.send(err));
});

router.post('/complete-order', (req, res) => {
  const orderToSave = req.body;
  orderModel.create(orderToSave, (err) => {
    if (err) {
      console.log('Error Inserting Order #' + orderToSave.orderNo);
    } else {
      res.send('Order #' + orderToSave.orderNo + ' saved to orders collection')
      console.log('Order #' + orderToSave.orderNo + ' saved to orders collection');
    }
  });

});

module.exports = router;