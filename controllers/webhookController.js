const userModel = require("../models/userModel");
const coordinatorModel = require("../models/coordinatorModel");
const smsService = require("../services/smsService");
const emailService = require("../services/emailService");
const twilioService = require("../services/twilioService");

const handleIncomingCall = async (req, res) => {
  try {
    // Detailed logging of the entire request
    console.log("=== WEBHOOK CALL RECEIVED ===");
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    console.log("Query:", JSON.stringify(req.query));
    console.log("Method:", req.method);
    console.log("=== END WEBHOOK DETAILS ===");

    const { CallSid, From, CallStatus } = req.body;

    console.log(
      `Extracted values - CallSid: ${CallSid}, From: ${From}, CallStatus: ${CallStatus}`
    );

    if (!From) {
      console.log("WARNING: 'From' parameter is missing in the request body");
    }

    if (CallStatus !== "ringing" && CallStatus !== "in-progress") {
      console.log(`Call status ${CallStatus} doesn't need processing`);
      return res.status(200).send();
    }

    // Format TwiML response to end the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Hangup/>
    </Response>`;

    res.set("Content-Type", "text/xml");
    res.send(twiml);

    // Process call in background if From is provided
    if (From) {
      processIncomingCall(From, CallSid).catch((err) => {
        console.error("Error processing incoming call:", err);
      });
    } else {
      console.error("Cannot process call without 'From' parameter");
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    console.error(error.stack);
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
        console.log(
          "Available coordinator:",
          coordinator ? coordinator.name : "None found"
        );
      }

      // Create new user
      const newUser = await userModel.createUser({
        phone_number: phoneNumber,
        coordinator_id: coordinator ? coordinator.id : null,
      });
      console.log("Created new user with ID:", newUser.id);

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
          console.error(notifyError.stack);
          // Continue execution even if coordinator notification fails
        }
      }

      try {
        // Send SMS with app download link
        const smsMessage = `Thank you for your interest! Download our app at: ${process.env.APP_DOWNLOAD_LINK}`;
        console.log(
          `Attempting to send SMS to ${phoneNumber}: "${smsMessage}"`
        );
        const smsResult = await smsService.sendSMS(phoneNumber, smsMessage);
        console.log("SMS result:", smsResult);

        if (smsResult.success && smsResult.sent) {
          await userModel.updateSmsStatus(newUser.id, true);
          console.log("Updated user SMS status to sent");
        }
      } catch (smsError) {
        console.error("SMS sending failed during call processing:", smsError);
        console.error(smsError.stack);
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
    console.error(error.stack);
  }
};

const handleStatusCallback = async (req, res) => {
  try {
    console.log("=== STATUS CALLBACK RECEIVED ===");
    console.log("Status callback body:", JSON.stringify(req.body));

    const { CallSid, CallStatus, From } = req.body;
    console.log(`Call ${CallSid} status updated to ${CallStatus}`);

    res.status(200).send();
  } catch (error) {
    console.error("Error handling status callback:", error);
    console.error(error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  handleIncomingCall,
  handleStatusCallback,
};
