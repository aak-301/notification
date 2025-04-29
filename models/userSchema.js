// models/userSchema.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  call_time: {
    type: Date,
    default: Date.now,
  },
  sms_sent: {
    type: Boolean,
    default: false,
  },
  email_sent: {
    type: Boolean,
    default: false,
  },
  coordinator_id: {
    type: Schema.Types.ObjectId,
    ref: "Coordinator",
    default: null,
  },
  status: {
    type: String,
    default: "pending",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
