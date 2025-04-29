require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { connectToDatabase } = require("./models/db");
const { initializeDatabase } = require("./utils/initDb");
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
console.log(
  `- MONGODB_URI: ${
    process.env.MONGODB_URI || "mongodb://localhost:27017/call-registration"
  }`
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const connected = await connectToDatabase();
    if (!connected) {
      console.error("Failed to connect to MongoDB. Exiting application.");
      process.exit(1);
    }

    // Initialize default data
    await initializeDatabase();

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
        message:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(
        `Test endpoint: http://localhost:${PORT}/api/users/test-register?phoneNumber=+917466XXXXXX`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
