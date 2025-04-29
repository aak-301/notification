const userModel = require("../models/userModel");
const coordinatorModel = require("../models/coordinatorModel");
const smsService = require("../services/smsService");
const emailService = require("../services/emailService");

const registerUser = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Log the incoming phone number for debugging
    console.log(
      `Received registration request for phone number: ${phoneNumber}`
    );

    // Check if user already exists
    const existingUser = await userModel.getUserByPhoneNumber(phoneNumber);
    if (existingUser) {
      return res.status(409).json({
        error: "User already registered",
        user: existingUser,
      });
    }

    // Get available coordinator
    let coordinator = null;
    if (process.env.AUTO_ASSIGN === "true") {
      coordinator = await coordinatorModel.getAvailableCoordinator();
      if (!coordinator) {
        return res.status(503).json({ error: "No coordinators available" });
      }
    }

    // Create new user
    const user = await userModel.createUser({
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

    // Send SMS if enabled
    let smsResult = { success: false, sent: false };

    try {
      const smsMessage = `Thank you for your interest! Download our app at: ${process.env.APP_DOWNLOAD_LINK}`;
      smsResult = await smsService.sendSMS(phoneNumber, smsMessage);

      if (smsResult.success && smsResult.sent) {
        await userModel.updateSmsStatus(user.id, true);
      }
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
      // Continue execution even if SMS fails
    }

    // Response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        ...user,
        coordinator: coordinator
          ? {
              id: coordinator.id,
              name: coordinator.name,
              phone_number: coordinator.phone_number,
            }
          : null,
      },
      sms_sent: smsResult.success && smsResult.sent,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await userModel.getUserByPhoneNumber(phoneNumber);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  getAllUsers,
  getUserByPhone,
};
