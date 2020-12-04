const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

const uniqueValidator = require("mongoose-unique-validator");
const userSchema = mongoose.Schema({
  name: { type: String },
  username: { type: String },
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  adCredits: { type: Number, default: 0 },
  city: { type: String },
  state: { type: String },
});

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("users", userSchema);
