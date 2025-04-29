const express = require("express");
const webhookController = require("../controllers/webhookController");

const router = express.Router();

console.log("In webhook rOute");

// Handle incoming calls from Twilio
router.post("/voice", webhookController.handleIncomingCall);

// Handle status callbacks from Twilio
router.post("/status", webhookController.handleStatusCallback);

module.exports = router;
