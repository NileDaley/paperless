var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderItemsSchema = require('../schemas/orderItems');

var orderSchema = new Schema({
    orderNo: Number,
    tableNo: Number,
    totalPreTax: Number,
    vatAmount: Number,
    totalPostTax: Number,
    order: [orderItemsSchema]
})

module.exports = orderSchema;