const axios = require("axios");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

// Sandbox configuration (FOR TESTING ONLY)
const BKASH_CONFIG = {
  baseURL: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  appKey: "4f6o0cjiki2rfm34kfdadl1eqq",
  appSecret: "2is7hdktrekvrbljjh44ll3d6l1dtjo4pasmjvs5vl5qr3fug4b",
  username: "sandboxTokenizedUser02",
  password: "sandboxTokenizedUser02@12345",
  merchantNumber: "01770618575",
  callbackURL: "https://yourdomain.com/api/bkash/callback",
};

// Token caching
let tokenCache = {
  token: null,
  expiresAt: 0,
};

// Helper function to get bKash token
const getBKashToken = async () => {
  try {
    // Return cached token if valid
    if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
      return tokenCache.token;
    }

    const response = await axios.post(
      `${BKASH_CONFIG.baseURL}/tokenized/checkout/token/grant`,
      {
        app_key: BKASH_CONFIG.appKey,
        app_secret: BKASH_CONFIG.appSecret,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: BKASH_CONFIG.username,
          password: BKASH_CONFIG.password,
        },
        timeout: 10000,
      }
    );

    if (!response.data?.id_token) {
      throw new Error("Invalid token response");
    }

    // Cache token with 5 minute buffer
    tokenCache = {
      token: response.data.id_token,
      expiresAt: Date.now() + response.data.expires_in * 1000 - 300000,
    };

    return tokenCache.token;
  } catch (error) {
    console.error("Token Error:", error.response?.data || error.message);
    throw new Error("bKash authentication failed");
  }
};

// Main controller functions
const initiatePayment = async (req, res) => {
  try {
    const { amount, bookingId, customerName, customerPhone } = req.body;

    // Validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!bookingId || !customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const token = await getBKashToken();
    const merchantInvoiceNumber = `INV-${Date.now()}`;

    const response = await axios.post(
      `${BKASH_CONFIG.baseURL}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: customerPhone,
        callbackURL: BKASH_CONFIG.callbackURL,
        amount: amount.toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber,
        merchantAssociationInfo: "Hotel Booking",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": BKASH_CONFIG.appKey,
        },
        timeout: 15000,
      }
    );

    if (!response.data?.bkashURL || !response.data?.paymentID) {
      throw new Error("Invalid response from bKash");
    }

    // Save payment record
    const payment = new Payment({
      bookingId,
      paymentMethod: "bKash",
      amount,
      status: "Pending",
      bKashPaymentID: response.data.paymentID,
      customerName,
      customerPhone,
      merchantInvoiceNumber,
    });

    await payment.save();

    // Update booking
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "Pending",
      paymentMethod: "bKash",
      paymentAmount: amount,
    });

    return res.json({
      success: true,
      paymentUrl: response.data.bkashURL,
      paymentID: response.data.paymentID,
    });
  } catch (error) {
    console.error("Initiate Error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.errorMessage || "Payment initiation failed",
    });
  }
};

const executePayment = async (req, res) => {
  try {
    const { paymentID } = req.body;

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        message: "paymentID is required",
      });
    }

    const token = await getBKashToken();
    const response = await axios.post(
      `${BKASH_CONFIG.baseURL}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": BKASH_CONFIG.appKey,
        },
        timeout: 15000,
      }
    );

    if (response.data?.transactionStatus !== "Completed") {
      throw new Error(response.data?.errorMessage || "Payment not completed");
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { bKashPaymentID: paymentID },
      {
        status: "Completed",
        transactionId: response.data.trxID,
        paymentDate: new Date(),
      }
    );

    // Update booking
    const payment = await Payment.findOne({ bKashPaymentID: paymentID });
    if (payment) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: "Completed",
        transactionId: response.data.trxID,
      });
    }

    return res.json({
      success: true,
      transactionStatus: "Completed",
      trxID: response.data.trxID,
      amount: response.data.amount,
    });
  } catch (error) {
    console.error("Execute Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.errorMessage || "Payment execution failed",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentID } = req.body;

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        message: "paymentID is required",
      });
    }

    const token = await getBKashToken();
    const response = await axios.post(
      `${BKASH_CONFIG.baseURL}/tokenized/checkout/payment/status`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": BKASH_CONFIG.appKey,
        },
        timeout: 15000,
      }
    );

    if (!response.data?.transactionStatus) {
      throw new Error("Invalid verification response");
    }

    return res.json({
      success: true,
      transactionStatus: response.data.transactionStatus,
      trxID: response.data.trxID,
    });
  } catch (error) {
    console.error("Verify Error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.errorMessage || "Payment verification failed",
    });
  }
};

const callback = async (req, res) => {
  try {
    const { paymentID, status } = req.body;
    console.log("Callback received:", { paymentID, status });

    if (status === "success" && paymentID) {
      // Verify the payment
      const payment = await Payment.findOne({ bKashPaymentID: paymentID });
      if (payment && payment.status === "Pending") {
        await executePayment({ body: { paymentID } }, res);
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error("Callback Error:", error.message);
    res.status(500).send();
  }
};

// Export all controller functions
module.exports = {
  initiatePayment,
  executePayment,
  verifyPayment,
  callback,
};
