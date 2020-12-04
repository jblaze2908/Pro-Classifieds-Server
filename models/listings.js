const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const uniqueValidator = require("mongoose-unique-validator");
const listingsSchema = mongoose.Schema({
  isFeatured: { type: Boolean, default: false },
  featuredTillDate: { type: Date },
  productId: { type: String, required: true },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: { type: Date, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  askingPrice: { type: String, required: true },
  images: [{ type: String }],
  status: { type: String, enum: ["Sold", "Not Sold"] },
});
listingsSchema.plugin(uniqueValidator);
module.exports = mongoose.model("listings", listingsSchema);
