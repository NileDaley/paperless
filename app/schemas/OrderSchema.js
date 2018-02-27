const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  table: Number,
  items: [{
    quantity: Number,
    item: { type: Schema.Types.ObjectId, ref: 'OrderLine' }
  }],
  date: String,
  customers: Number,
  status: String,
  bill: { type: Schema.Types.ObjectId, ref: 'Bill' }  
});

module.exports = OrderSchema;
