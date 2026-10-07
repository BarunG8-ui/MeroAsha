const User = require("../models/User");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Active must be true or false"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.active = active;

    await user.save();

    res.status(200).json({
      success: true,
      message: active
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const allowedRoles = [
      "PATIENT",
      "DOCTOR",
      "NURSE",
      "RECEPTION",
      "LAB_STAFF",
      "PHARMACIST",
      "BLOOD_BANK_STAFF",
      "EMERGENCY_STAFF",
      "ADMIN"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole
};