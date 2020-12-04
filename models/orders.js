const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const orderSchema = mongoose.Schema({
  order_id: { type: String, unique: true },
  receipt_no: { type: String, unique: true },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  amount: { type: Number, required: true },
  noOfAdCredits: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  time_of_completion: { type: Date, required: false },
  status: { type: String, enum: ["Pending", "Completed"] },
});
orderSchema.plugin(uniqueValidator);
module.exports = mongoose.model("orders", orderSchema);
