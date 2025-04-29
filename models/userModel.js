// models/userModel.js
const User = require("./userSchema");
const Coordinator = require("./coordinatorSchema");

const createUser = async (userData) => {
  try {
    const newUser = new User({
      phone_number: userData.phone_number,
      coordinator_id: userData.coordinator_id || null,
    });

    const savedUser = await newUser.save();
    return {
      id: savedUser._id,
      phone_number: savedUser.phone_number,
      coordinator_id: savedUser.coordinator_id,
    };
  } catch (error) {
    throw error;
  }
};

const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    const user = await User.findOne({ phone_number: phoneNumber }).populate({
      path: "coordinator_id",
      select: "name phone_number email",
    });

    if (!user) return null;

    // Format the response to match the expected structure from the SQLite version
    return {
      id: user._id,
      phone_number: user.phone_number,
      call_time: user.call_time,
      sms_sent: user.sms_sent,
      email_sent: user.email_sent,
      coordinator_id: user.coordinator_id ? user.coordinator_id._id : null,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      coordinator_name: user.coordinator_id ? user.coordinator_id.name : null,
      coordinator_phone: user.coordinator_id
        ? user.coordinator_id.phone_number
        : null,
    };
  } catch (error) {
    throw error;
  }
};

const updateUserStatus = async (userId, status) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: status,
        updated_at: new Date(),
      },
      { new: true }
    );

    return {
      id: updatedUser._id,
      status: updatedUser.status,
      changes: 1, // Mimic SQLite response
    };
  } catch (error) {
    throw error;
  }
};

const updateSmsStatus = async (userId, sent) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        sms_sent: sent,
        updated_at: new Date(),
      },
      { new: true }
    );

    return {
      id: updatedUser._id,
      sms_sent: updatedUser.sms_sent,
      changes: 1, // Mimic SQLite response
    };
  } catch (error) {
    throw error;
  }
};

const updateEmailStatus = async (userId, sent) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        email_sent: sent,
        updated_at: new Date(),
      },
      { new: true }
    );

    return {
      id: updatedUser._id,
      email_sent: updatedUser.email_sent,
      changes: 1, // Mimic SQLite response
    };
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find().populate({
      path: "coordinator_id",
      select: "name",
    });

    // Format the response to match the expected structure
    return users.map((user) => ({
      id: user._id,
      phone_number: user.phone_number,
      call_time: user.call_time,
      sms_sent: user.sms_sent,
      email_sent: user.email_sent,
      coordinator_id: user.coordinator_id ? user.coordinator_id._id : null,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      coordinator_name: user.coordinator_id ? user.coordinator_id.name : null,
    }));
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByPhoneNumber,
  updateUserStatus,
  updateSmsStatus,
  updateEmailStatus,
  getAllUsers,
};
