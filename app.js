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

// Increase JSON payload size limit if needed
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, headers, body } = req;

  console.log(`[${timestamp}] Request: ${method} ${url}`);

  // Log content type and forwarded headers (useful for proxy detection)
  const loggableHeaders = {
    "content-type": headers["content-type"],
    "x-forwarded-for": headers["x-forwarded-for"],
    "x-forwarded-host": headers["x-forwarded-host"],
    "x-real-ip": headers["x-real-ip"],
    "user-agent": headers["user-agent"],
  };

  console.log(`Headers: ${JSON.stringify(loggableHeaders)}`);

  // Only log the body for non-GET requests and only if it's not too large
  if (method !== "GET" && Object.keys(body || {}).length > 0) {
    console.log(`Body: ${JSON.stringify(body)}`);
  }

  // Log response status
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    console.log(
      `[${timestamp}] Response: ${method} ${url} - Status: ${res.statusCode}`
    );
    return originalEnd.call(this, chunk, encoding);
  };

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

    // Simple health check endpoint
    app.get("/health", (req, res) => {
      res
        .status(200)
        .json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error("Unhandled application error:", err);
      console.error(err.stack);
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
      console.log(`Webhook test: http://localhost:${PORT}/webhook/test`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
