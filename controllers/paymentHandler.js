const Razorpay = require("razorpay");
const crypto = require("crypto");
const Transactions = require("../models/transactions");
const Order = require("../models/orders");
const User = require("../models/users");
const config = require("../config");
const instance = new Razorpay({
  key_id: config.razorpay.id,
  key_secret: config.razorpay.secret,
});
const transactionsHandler = {
  create_order: async (req, res) => {
    try {
      let order;
      const user = await User.findById(req.userData.userId);
      if (!user) return res.status(250).json({ message: "User not found." });
      let receipt_no = await generateReceiptNumber();
      let amt = Math.round(req.body.amount * 100);
      let response = await instance.orders.create({
        amount: amt,
        currency: "INR",
        receipt: receipt_no,
        payment_capture: true,
      });
      console.log(response);
      let time = new Date(response.created_at * 1000);
      let noOfAdCredits;
      let plans = config.plans;
      for (const plan of plans) {
        if (plan.price === amt / 100) noOfAdCredits = plan.noOfAdCredits;
      }
      if (!noOfAdCredits) {
        return res.status(500).json({ message: "Invalid plan." });
      }
      order = {
        order_id: response.id,
        receipt_no: receipt_no,
        customerId: req.userData.userId,
        amount: amt / 100,
        noOfAdCredits: noOfAdCredits,
        createdAt: time,
        status: "Pending",
      };
      const newOrder = new Order(order);
      await newOrder.save();
      return res.status(200).json({
        order_id: response.id,
        receipt_no: receipt_no,
        created_at: time,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
  verify_signature: async (req, res) => {
    try {
      let hmac = crypto.createHmac("sha256", config.razorpay.secret);
      let order_id = req.body.razorpay_order_id;
      let payment_signature = req.body.razorpay_signature;
      let payment_id = req.body.razorpay_payment_id;
      let data = hmac.update(order_id + "|" + payment_id);
      let generated_signature = data.digest("hex");
      if (generated_signature != payment_signature) {
        let body = JSON.parse(JSON.stringify(req.body));
        let response = await Order.findOne({
          order_id: order_id,
        });
        response.status = "Failed";
        response = await response.save();
        var desc = new Buffer.from(body["error[description]"]);
        desc = desc.toString("base64");
        return res.status(500).json({ desc });
      }
      let time = new Date();
      let response = await Order.findOne({ order_id: order_id });
      console.log(response);
      response.status = "Completed";
      response.completed_at = time;
      response = await response.save();
      let transaction = await Transactions.findOne({ order_id: order_id });
      if (transaction) {
        return res.status(500).json({
          message: "Transaction already exists with this order_id.",
        });
      }
      let newTransaction = {
        order_id: response.order_id,
        transaction_id: payment_id,
        customerId: response.customerId,
        time_of_payment: time,
        amount: response.amount,
        noOfAdCredits: response.noOfAdCredits,
      };
      newTransaction = new Transactions(newTransaction);
      let user = await User.findById(req.userData.userId);
      let adCredits = (user.adCredits || 0) + response.noOfAdCredits;
      user.adCredits = adCredits;
      console.log(user.adCredits);
      console.log(adCredits);
      await Promise.all([newTransaction.save(), user.save()]);
      return res.status(200).json({
        message: "Transaction successful.",
        adCredits: user.adCredits,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Something went wrong." });
    }
  },
};
const generateReceiptNumber = () => {
  return new Promise(async (resolve, reject) => {
    let orders = await Order.find().lean();
    let receiptNumber = "order_rct_" + (orders.length + 1);
    resolve(receiptNumber);
  });
};
module.exports = transactionsHandler;
