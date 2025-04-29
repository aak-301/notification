const { db } = require("./db");

const createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const { phone_number, coordinator_id } = userData;

    const sql = `
      INSERT INTO users (phone_number, coordinator_id)
      VALUES (?, ?)
    `;

    db.run(sql, [phone_number, coordinator_id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: this.lastID, phone_number, coordinator_id });
    });
  });
};

const getUserByPhoneNumber = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.*, c.name as coordinator_name, c.phone_number as coordinator_phone
      FROM users u
      LEFT JOIN coordinators c ON u.coordinator_id = c.id
      WHERE u.phone_number = ?
    `;

    db.get(sql, [phoneNumber], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

const updateUserStatus = (userId, status) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [status, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: userId, status, changes: this.changes });
    });
  });
};

const updateSmsStatus = (userId, sent) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users
      SET sms_sent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [sent ? 1 : 0, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: userId, sms_sent: sent, changes: this.changes });
    });
  });
};

const updateEmailStatus = (userId, sent) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users
      SET email_sent = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [sent ? 1 : 0, userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ id: userId, email_sent: sent, changes: this.changes });
    });
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.*, c.name as coordinator_name
      FROM users u
      LEFT JOIN coordinators c ON u.coordinator_id = c.id
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

module.exports = {
  createUser,
  getUserByPhoneNumber,
  updateUserStatus,
  updateSmsStatus,
  updateEmailStatus,
  getAllUsers,
};
