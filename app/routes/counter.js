const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const orderSchema = require('../schemas/order');
const orderModel = mongoose.model('orders', orderSchema, 'orders');

/* GET users listing. */
router.get('/all-orders', (req, res, next) => {
  let Order = mongoose.model('order', orderSchema);
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