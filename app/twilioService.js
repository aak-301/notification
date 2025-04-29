const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const getCallInfo = (callSid) => {
  return client.calls(callSid).fetch();
};

module.exports = {
  client,
  getCallInfo,
};
