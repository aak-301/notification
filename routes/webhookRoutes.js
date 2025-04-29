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

module.exports = router;
