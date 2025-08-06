const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["bKash", "Nagad", "Bank", "Cash"],
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  },
  transactionId: { type: String },
  paymentReference: { type: String },
  bKashPaymentID: { type: String },
  customerName: { type: String },
  customerPhone: { type: String },
  merchantInvoiceNumber: { type: String },
  paymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", PaymentSchema);
