const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderLineSchema = new Schema({
    quantity: Number,
    item: { type: Schema.Types.ObjectId, ref: 'FoodItem' }
});

module.exports = OrderLineSchema;
