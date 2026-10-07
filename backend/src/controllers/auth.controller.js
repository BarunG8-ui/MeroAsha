const User = require("../models/User");
const Patient = require("../models/Patient");
const {
  hashPassword,
  generateToken,
  comparePassword,
} = require("../services/auth.service");

// Helper to generate a unique Patient ID
const generatePatientId = async () => {
  let patientId;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    patientId = `PAT-${randomNumber}`;
    exists = await Patient.findOne({ patientId });
  }

  return patientId;
};

// ============================================================
// REGISTER (Creates User + Patient profile)
// ============================================================
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const userRole = role || "PATIENT";

    if (userRole !== "PATIENT") {
      return res.status(403).json({
        success: false,
        message: "Public registration is only available for patients",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // 1. Create User account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role: "PATIENT",
    });

    // 2. Automatically create Patient profile
    const patientId = await generatePatientId();
    const patient = await Patient.create({
      userId: user._id,
      patientId,
      phone: user.phone || null,
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Patient registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId: patient.patientId,
        active: user.active,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// LOGIN
// ============================================================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    // If patient, find patientId
    let patientId = null;
    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) {
        patientId = patient.patientId;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId,
        active: user.active,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET CURRENT USER (/api/auth/me)
// ============================================================
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    let patientId = null;
    if (user.role === "PATIENT") {
      const patient = await Patient.findOne({ userId: user._id });
      if (patient) {
        patientId = patient.patientId;
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId,
        active: user.active,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
};