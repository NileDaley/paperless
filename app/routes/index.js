var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let moment = require('moment');

let OrderSchema = require('../schemas/OrderSchema');
let Order = mongoose.model('Order', OrderSchema);

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', {});
});

router.post('/', (req, res) => {

  let {table, order, customers} = req.body;

  let newOrder = new Order({
    table,
    date: moment().format('YYYY-MM-DD HH:MM:SS'),
    customers,
    status: 'sent',
    order
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

router.patch('/:id', (req, res) => {

  let {table, order, customers, status} = req.body;

  Order.findByIdAndUpdate(req.params.id,
      {
        $set: {
          table,
          date: moment().format('YYYY-MM-DD HH:MM:SS'),
          customers,
          status,
          order
        }
      }, {'new': true})
      .then(response => {
        res.statusCode = 200;
        res.json(response);
      })
      .catch(err => {
        res.statusCode = 500;
        res.json(err);
      });

});

module.exports = router;
