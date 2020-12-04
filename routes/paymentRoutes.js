const express = require("express");
const router = express.Router();
const paymentHandler = require("../controllers/paymentHandler");
const checkAuth = require("../middleware/checkAuth");
router.post("/rzp/create_order", checkAuth, paymentHandler.create_order);
router.post(
  "/rzp/verify_signature",
  checkAuth,
  paymentHandler.verify_signature
);
module.exports = router;
