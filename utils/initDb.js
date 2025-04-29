// utils/initDb.js
const Coordinator = require("../models/coordinatorSchema");

const initializeDatabase = async () => {
  try {
    // Check if any coordinators exist
    const count = await Coordinator.countDocuments();

    if (count === 0) {
      console.log("No coordinators found. Adding default coordinators...");

      // Insert default coordinators
      const coordinators = [
        {
          name: "Coordinator 1",
          email: "aakashshivanshu5@gmail.com",
          phone_number: "+918252984299",
        },
        // You can add more coordinators here as needed:
        // {
        //   name: "Coordinator 2",
        //   email: "coord2@example.com",
        //   phone_number: "+917466000002",
        // },
        // etc.
      ];

      await Coordinator.insertMany(coordinators);
      console.log("Default coordinators added successfully");
    } else {
      console.log(`Found ${count} existing coordinators`);
    }

    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
};
