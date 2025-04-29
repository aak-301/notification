const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "..", "database.sqlite"));

const initializeDatabase = () => {
  db.serialize(() => {
    // Create Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        call_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sms_sent BOOLEAN DEFAULT 0,
        email_sent BOOLEAN DEFAULT 0,
        coordinator_id INTEGER,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coordinator_id) REFERENCES coordinators(id)
      )
    `);

    // Create Coordinators table
    db.run(`
      CREATE TABLE IF NOT EXISTS coordinators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone_number TEXT UNIQUE NOT NULL,
        current_assignments INTEGER DEFAULT 0,
        max_assignments INTEGER DEFAULT 10,
        active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default coordinators
    db.get(`SELECT COUNT(*) as count FROM coordinators`, (err, row) => {
      if (err) {
        console.error("Error checking coordinators:", err.message);
        return;
      }

      if (row.count === 0) {
        const coordinators = [
          {
            name: "Coordinator 1",
            email: "aakashshivanshu5@gmail.com",
            phone_number: "+918252984299",
          },
          // {
          //   name: "Coordinator 2",
          //   email: "coord2@example.com",
          //   phone_number: "+917466000002",
          // },
          // {
          //   name: "Coordinator 3",
          //   email: "coord3@example.com",
          //   phone_number: "+917466000003",
          // },
          // {
          //   name: "Coordinator 4",
          //   email: "coord4@example.com",
          //   phone_number: "+917466000004",
          // },
          // {
          //   name: "Coordinator 5",
          //   email: "coord5@example.com",
          //   phone_number: "+917466000005",
          // },
        ];

        const stmt = db.prepare(`
          INSERT INTO coordinators (name, email, phone_number)
          VALUES (?, ?, ?)
        `);

        coordinators.forEach((coord) => {
          stmt.run(coord.name, coord.email, coord.phone_number);
        });

        stmt.finalize();
        console.log("Default coordinators added");
      }
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
};
