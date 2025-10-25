const express = require("express");
const { createSafepayOrder, verifySafepayPayment, safepayWebhook } = require("../controllers/safepayController");

const router = express.Router();

// Create checkout session
router.post("/create-checkout", createSafepayOrder);

// Verify payment after redirect
router.get("/verify", verifySafepayPayment);

// Handle Safepay Webhooks
router.post("/webhook", safepayWebhook);

module.exports = router;