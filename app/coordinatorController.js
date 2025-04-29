const coordinatorModel = require("../models/coordinatorModel");

const getAllCoordinators = async (req, res) => {
  try {
    const coordinators = await coordinatorModel.getAllCoordinators();
    res.json(coordinators);
  } catch (error) {
    console.error("Error getting coordinators:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCoordinatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const coordinator = await coordinatorModel.getCoordinatorById(id);

    if (!coordinator) {
      return res.status(404).json({ error: "Coordinator not found" });
    }

    res.json(coordinator);
  } catch (error) {
    console.error("Error getting coordinator:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllCoordinators,
  getCoordinatorById,
};
