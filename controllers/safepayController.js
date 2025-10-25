const axios = require("axios");
require("dotenv").config();

// ✅ Base URL selection
const BASE_URL =
  process.env.SAFE_PAY_ENV === "sandbox"
    ? "https://sandbox.api.getsafepay.com"
    : "https://api.getsafepay.com";

/**
 * ------------------------------------------------------------
 * 1️⃣ Create Checkout Order (called by Frontend)
 * ------------------------------------------------------------
 */
const createSafepayOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "Amount and currency are required.",
      });
    }

    console.log("🔹 Creating Safepay Order with:", { amount, currency });
    console.log("🔹 Using API:", `${BASE_URL}/order/v1/init`);
    console.log("🔹 API Key Loaded:", !!process.env.SAFE_PAY_API_KEY);

    // ✅ REQUIRED fields: client and environment
    const payload = {
      amount,
      currency,
      order_id: `order_${Date.now()}`,
      client: "custom_website", // 👈 you can name it anything identifying your app
      environment:
        process.env.SAFE_PAY_ENV === "sandbox" ? "sandbox" : "production",
    };

    // ✅ Send request to Safepay
    const response = await axios.post(`${BASE_URL}/order/v1/init`, payload, {
      headers: {
        Authorization: `Bearer ${process.env.SAFE_PAY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Safepay API Response:", response.data);

    const token = response.data?.data?.token;
    if (!token) {
      console.error("❌ No token returned by Safepay:", response.data);
      return res.status(400).json({
        success: false,
        message: "Failed to create Safepay order: No token received.",
      });
    }

    // ✅ Generate Checkout URL
    const checkoutUrl = `${BASE_URL}/checkout/pay/${token}?redirect_url=${process.env.SAFE_PAY_RETURN_URL}&cancel_url=${process.env.SAFE_PAY_CANCEL_URL}`;

    console.log("✅ Checkout URL Created:", checkoutUrl);

    return res.status(200).json({
      success: true,
      checkoutUrl,
      token,
    });
  } catch (err) {
    console.error("❌ Safepay Error Details:");
    console.error("Status:", err.response?.status);
    console.error("Response:", err.response?.data);
    console.error("Message:", err.message);

    return res.status(500).json({
      success: false,
      message: err.response?.data?.message || "Error creating Safepay order",
      details: err.response?.data || null,
    });
  }
};

/**
 * ------------------------------------------------------------
 * 2️⃣ Verify Payment After Redirect
 * ------------------------------------------------------------
 */
const verifySafepayPayment = async (req, res) => {
  try {
    const { tracker } = req.query;
    if (!tracker)
      return res.status(400).json({ success: false, message: "Missing tracker" });

    console.log("🔹 Verifying payment with tracker:", tracker);

    const response = await axios.post(
      `${BASE_URL}/order/v1/track`,
      { tracker },
      {
        headers: {
          Authorization: `Bearer ${process.env.SAFE_PAY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Verification Response:", response.data);

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (err) {
    console.error("❌ Verification Error:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      details: err.response?.data || null,
    });
  }
};

/**
 * ------------------------------------------------------------
 * 3️⃣ Webhook for Payment Status
 * ------------------------------------------------------------
 */
const safepayWebhook = async (req, res) => {
  try {
    console.log("🔹 Webhook Received:", JSON.stringify(req.body, null, 2));

    const { tracker, state } = req.body;

    if (state === "PAID") {
      console.log("✅ Payment successful for tracker:", tracker);
      // TODO: Update your database or order status here
    } else if (state === "CANCELLED") {
      console.log("⚠️ Payment cancelled for tracker:", tracker);
      // TODO: Handle cancellation logic here
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = {
  createSafepayOrder,
  verifySafepayPayment,
  safepayWebhook,
};
