const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  executePayment,
  verifyPayment,
  callback,
} = require("../controllers/paymentController");

// Payment routes
router.post("/initiate", initiatePayment);
router.post("/execute", executePayment);
router.post("/verify", verifyPayment);
router.post("/callback", callback);

module.exports = router;
