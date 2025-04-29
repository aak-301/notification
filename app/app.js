require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { initializeDatabase } = require("./models/db");
const userRoutes = require("./routes/userRoutes");
const coordinatorRoutes = require("./routes/coordinatorRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// Display environment configuration at startup
console.log("Application Configuration:");
console.log(`- PORT: ${process.env.PORT || 3000}`);
console.log(`- AUTO_ASSIGN: ${process.env.AUTO_ASSIGN}`);
console.log(
  `- SEND_SMS_ON_REGISTRATION: ${process.env.SEND_SMS_ON_REGISTRATION}`
);
console.log(
  `- SEND_EMAIL_ON_REGISTRATION: ${process.env.SEND_EMAIL_ON_REGISTRATION}`
);
console.log(
  `- TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || "Not set"}`
);
console.log(
  `- APP_DOWNLOAD_LINK: ${process.env.APP_DOWNLOAD_LINK || "Not set"}`
);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize database
initializeDatabase();

console.log("Called hehe");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/coordinators", coordinatorRoutes);
app.use("/webhook", webhookRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Call Registration APIs");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Test endpoint: http://localhost:${PORT}/api/users/test-register?phoneNumber=+917466XXXXXX`
  );
});
