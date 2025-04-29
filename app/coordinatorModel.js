const { db } = require("./db");

const getAvailableCoordinator = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM coordinators
      WHERE active = 1 AND current_assignments < max_assignments
      ORDER BY current_assignments ASC
      LIMIT 1
    `;

    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const incrementAssignments = (coordinatorId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE coordinators
      SET current_assignments = current_assignments + 1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [coordinatorId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: coordinatorId, changes: this.changes });
    });
  });
};

const decrementAssignments = (coordinatorId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE coordinators
      SET current_assignments = MAX(0, current_assignments - 1), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [coordinatorId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: coordinatorId, changes: this.changes });
    });
  });
};

const getAllCoordinators = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM coordinators
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
};

const getCoordinatorById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM coordinators WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

module.exports = {
  getAvailableCoordinator,
  incrementAssignments,
  decrementAssignments,
  getAllCoordinators,
  getCoordinatorById,
};
