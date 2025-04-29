// models/coordinatorModel.js
const Coordinator = require("./coordinatorSchema");

const getAvailableCoordinator = async () => {
  try {
    const coordinator = await Coordinator.findOne({
      active: true,
      current_assignments: { $lt: "$max_assignments" },
    }).sort({ current_assignments: 1 });

    if (!coordinator) return null;

    return {
      id: coordinator._id,
      name: coordinator.name,
      email: coordinator.email,
      phone_number: coordinator.phone_number,
      current_assignments: coordinator.current_assignments,
      max_assignments: coordinator.max_assignments,
      active: coordinator.active,
    };
  } catch (error) {
    throw error;
  }
};

const incrementAssignments = async (coordinatorId) => {
  try {
    const updatedCoordinator = await Coordinator.findByIdAndUpdate(
      coordinatorId,
      {
        $inc: { current_assignments: 1 },
        updated_at: new Date(),
      },
      { new: true }
    );

    return {
      id: updatedCoordinator._id,
      changes: 1, // Mimic SQLite response
    };
  } catch (error) {
    throw error;
  }
};

const decrementAssignments = async (coordinatorId) => {
  try {
    const updatedCoordinator = await Coordinator.findByIdAndUpdate(
      coordinatorId,
      {
        $inc: { current_assignments: -1 },
        updated_at: new Date(),
      },
      { new: true }
    );

    // Ensure current_assignments doesn't go below 0
    if (updatedCoordinator.current_assignments < 0) {
      updatedCoordinator.current_assignments = 0;
      await updatedCoordinator.save();
    }

    return {
      id: updatedCoordinator._id,
      changes: 1, // Mimic SQLite response
    };
  } catch (error) {
    throw error;
  }
};

const getAllCoordinators = async () => {
  try {
    const coordinators = await Coordinator.find();

    return coordinators.map((coordinator) => ({
      id: coordinator._id,
      name: coordinator.name,
      email: coordinator.email,
      phone_number: coordinator.phone_number,
      current_assignments: coordinator.current_assignments,
      max_assignments: coordinator.max_assignments,
      active: coordinator.active,
      created_at: coordinator.created_at,
      updated_at: coordinator.updated_at,
    }));
  } catch (error) {
    throw error;
  }
};

const getCoordinatorById = async (id) => {
  try {
    const coordinator = await Coordinator.findById(id);

    if (!coordinator) return null;

    return {
      id: coordinator._id,
      name: coordinator.name,
      email: coordinator.email,
      phone_number: coordinator.phone_number,
      current_assignments: coordinator.current_assignments,
      max_assignments: coordinator.max_assignments,
      active: coordinator.active,
      created_at: coordinator.created_at,
      updated_at: coordinator.updated_at,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAvailableCoordinator,
  incrementAssignments,
  decrementAssignments,
  getAllCoordinators,
  getCoordinatorById,
};
