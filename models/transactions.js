const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const transactionsSchema = mongoose.Schema({
  order_id: { type: String, required: false, unique: true },
  transaction_id: { type: String, required: true, unique: true },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  time_of_payment: { type: Date, required: true },
  amount: { type: Number, required: true },
  noOfAdCredits: { type: Number, required: true },
});
transactionsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("transactions", transactionsSchema);
