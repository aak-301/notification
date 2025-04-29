// models/coordinatorSchema.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const coordinatorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  current_assignments: {
    type: Number,
    default: 0,
  },
  max_assignments: {
    type: Number,
    default: 10,
  },
  active: {
    type: Boolean,
    default: true,
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

// Create a function to find an available coordinator
coordinatorSchema.statics.findAvailable = function () {
  return this.findOne({
    active: true,
    current_assignments: { $lt: "$max_assignments" },
  }).sort({ current_assignments: 1 });
};

module.exports = mongoose.model("Coordinator", coordinatorSchema);
