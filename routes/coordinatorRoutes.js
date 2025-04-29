const express = require("express");
const coordinatorController = require("../controllers/coordinatorController");

const router = express.Router();

// Get all coordinators
router.get("/", coordinatorController.getAllCoordinators);

// Get coordinator by ID
router.get("/:id", coordinatorController.getCoordinatorById);

module.exports = router;
