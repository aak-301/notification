const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// Test endpoint to simulate a user calling
router.get("/test-register", userController.registerUser);

// Get all users
router.get("/", userController.getAllUsers);

// Get user by phone number
router.get("/:phoneNumber", userController.getUserByPhone);

module.exports = router;
