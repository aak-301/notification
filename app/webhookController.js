const userModel = require("../models/userModel");
const coordinatorModel = require("../models/coordinatorModel");
const smsService = require("../services/smsService");
const emailService = require("../services/emailService");
const twilioService = require("../services/twilioService");

const handleIncomingCall = async (req, res) => {
  try {
    const { CallSid, From, CallStatus } = req.body;

    console.log("Webhook received!");
    console.log("Call req body:", req.body);
    console.log(`Incoming call from ${From} with status ${CallStatus}`);

    if (CallStatus !== "ringing" && CallStatus !== "in-progress") {
      return res.status(200).send();
    }

    // Format TwiML response to end the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Hangup/>
    </Response>`;

    res.set("Content-Type", "text/xml");
    res.send(twiml);

    // Process call in background
    processIncomingCall(From, CallSid).catch((err) => {
      console.error("Error processing incoming call:", err);
    });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const processIncomingCall = async (phoneNumber, callSid) => {
  try {
    console.log(`Processing call ${callSid} from ${phoneNumber}`);

    // Check if user already exists
    let user = await userModel.getUserByPhoneNumber(phoneNumber);

    // If user doesn't exist, register them
    if (!user) {
      // Get available coordinator
      let coordinator = null;
      if (process.env.AUTO_ASSIGN === "true") {
        coordinator = await coordinatorModel.getAvailableCoordinator();
      }

      // Create new user
      const newUser = await userModel.createUser({
        phone_number: phoneNumber,
        coordinator_id: coordinator ? coordinator.id : null,
      });

      // Update coordinator's assignment count
      if (coordinator) {
        await coordinatorModel.incrementAssignments(coordinator.id);

        // Notify coordinator about the new assignment
        try {
          await smsService.notifyCoordinator(coordinator, {
            phone_number: phoneNumber,
          });
          console.log(`Notification sent to coordinator ${coordinator.name}`);
        } catch (notifyError) {
          console.error("Failed to notify coordinator:", notifyError);
          // Continue execution even if coordinator notification fails
        }
      }

      try {
        // Send SMS with app download link
        const smsMessage = `Thank you for your interest! Download our app at: ${process.env.APP_DOWNLOAD_LINK}`;
        const smsResult = await smsService.sendSMS(phoneNumber, smsMessage);

        if (smsResult.success && smsResult.sent) {
          await userModel.updateSmsStatus(newUser.id, true);
        }
      } catch (smsError) {
        console.error("SMS sending failed during call processing:", smsError);
        // Continue execution even if SMS fails
      }

      console.log(`New user registered from call: ${phoneNumber}`);
    } else {
      console.log(`Existing user called again: ${phoneNumber}`);
    }
  } catch (error) {
    console.error(
      `Error processing call ${callSid} from ${phoneNumber}:`,
      error
    );
  }
};

const handleStatusCallback = async (req, res) => {
  try {
    const { CallSid, CallStatus, From } = req.body;
    console.log(`Call ${CallSid} status updated to ${CallStatus}`);

    res.status(200).send();
  } catch (error) {
    console.error("Error handling status callback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  handleIncomingCall,
  handleStatusCallback,
};
