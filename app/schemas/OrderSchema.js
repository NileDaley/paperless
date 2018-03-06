const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrderLineSchema = require('./OrderLineSchema');
const BillSchema = require('./Bill');

const OrderSchema = new Schema({
  table: Number,
  items: [ OrderLineSchema ],
  date: String,
  customers: Number,
  status: String,
  bill: BillSchema,
});

module.exports = OrderSchema;
