// services/smsService.js for Twilio project
const { client } = require("./twilioService");

const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Make sure it has the country code
  if (!cleaned.startsWith("1") && !cleaned.startsWith("+")) {
    // For India numbers, add +91 if not present
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else {
      // Otherwise assume international format needs a +
      cleaned = `+${cleaned}`;
    }
  } else if (cleaned.startsWith("1") && cleaned.length === 11) {
    // For US numbers
    cleaned = `+${cleaned}`;
  }

  return cleaned;
};

const sendSMS = async (phoneNumber, message) => {
  try {
    if (process.env.SEND_SMS_ON_REGISTRATION !== "true") {
      console.log(
        `SMS sending disabled. Would send to ${phoneNumber}: ${message}`
      );
      return { success: true, sent: false };
    }

    // Format the phone number for Twilio
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`Sending SMS to formatted number: ${formattedNumber}`);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });

    return { success: true, sent: true, sid: result.sid };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, error: error.message };
  }
};

// Add the notifyCoordinator function that was missing
const notifyCoordinator = async (coordinator, userData) => {
  try {
    if (process.env.NOTIFY_COORDINATORS !== "true") {
      console.log(
        `Coordinator notification disabled. Would notify ${coordinator.name} about user ${userData.phone_number}`
      );
      return { success: true, sent: false };
    }

    const message = `Hello ${coordinator.name}, a new user with phone number ${userData.phone_number} has been assigned to you.`;

    return await sendSMS(coordinator.phone_number, message);
  } catch (error) {
    console.error("Error notifying coordinator:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  notifyCoordinator,
  formatPhoneNumber,
};
