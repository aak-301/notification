const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

console.log("Webhook routes initialized");

// Handle incoming calls from Twilio
router.post("/voice", webhookController.handleIncomingCall);

// Handle status callbacks from Twilio
router.post("/status", webhookController.handleStatusCallback);

// Add a simple test endpoint
router.get("/test", (req, res) => {
  console.log("Webhook test endpoint called");
  res.status(200).json({
    message: "Webhook endpoint is working",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint to simulate a Twilio voice webhook request
router.get("/test-voice", (req, res) => {
  console.log("Twilio voice webhook test endpoint called");

  // Create sample Twilio webhook data
  const mockTwilioData = {
    CallSid: "CA" + Date.now(),
    From: "+19876543210", // Replace with a test phone number
    CallStatus: "ringing",
    Direction: "inbound",
  };

  // Call the webhook handler with mock data
  req.body = mockTwilioData;

  // Forward to the actual handler
  webhookController.handleIncomingCall(req, res);
});

// Test endpoint to directly check Twilio credentials
router.get("/test-twilio", async (req, res) => {
  try {
    console.log("Testing Twilio credentials");

    // Check if Twilio credentials are set
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({
        error: "Twilio credentials not set",
        accountSidSet: !!process.env.TWILIO_ACCOUNT_SID,
        authTokenSet: !!process.env.TWILIO_AUTH_TOKEN,
      });
    }

    // Try to make a simple Twilio API call
    const twilioService = require("../services/twilioService");

    // Get account info as a simple test
    const account = await twilioService.client.api.accounts.get();

    res.status(200).json({
      success: true,
      accountSid: account.sid,
      accountName: account.friendlyName,
      accountStatus: account.status,
      message: "Twilio credentials are valid",
    });
  } catch (error) {
    console.error("Error testing Twilio credentials:", error);
    res.status(500).json({
      error: "Failed to connect to Twilio",
      message: error.message,
    });
  }
});

module.exports = router;
