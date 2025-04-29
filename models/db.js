// models/db.js
const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    // Get MongoDB connection string from environment variables
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/call-registration";

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB successfully");

    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return false;
  }
};

module.exports = {
  connectToDatabase,
};
