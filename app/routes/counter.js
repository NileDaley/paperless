const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const mongoDB = 'mongodb://paperless-test:password@ds149138.mlab.com:49138/paperless-test-adw';
mongoose.connect(mongoDB);
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('Connected to MongoDB server via mongoose.');
});

const orderSchema = require('../schemas/order');

var orderModel = mongoose.model('orders', orderSchema, 'orders');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('you\'re at the counter api');
});

router.post('/complete-order', function (req, res) {
  const orderToSave = req.body;
  orderModel.create(orderToSave, function (err) {
    if (err) {
      console.log('Error Inserting Order #' + orderToSave.orderNo);
    } else {
      res.send('Order #' + orderToSave.orderNo + ' saved to orders collection')
      console.log('Order #' + orderToSave.orderNo + ' saved to orders collection');
    }
  });

});

module.exports = router;