const express = require("express");

const {
  createPatient,
  getMyPatientProfile,
  updateMyPatientProfile,
  getPatientDashboard
} = require("../controllers/patient.controller");

const {
  authenticate
} = require("../middleware/auth.middleware");

const {
  authorizeRoles
} = require("../middleware/role.middleware");

const router = express.Router();

// ==========================================
// CREATE PATIENT PROFILE
// POST /api/patients
// ==========================================
router.post(
  "/",
  authenticate,
  authorizeRoles("PATIENT"),
  createPatient
);

// ==========================================
// GET MY PATIENT PROFILE
// GET /api/patients/me
// ==========================================
router.get(
  "/me",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyPatientProfile
);

// ==========================================
// UPDATE MY PATIENT PROFILE
// PATCH /api/patients/me
// ==========================================
router.patch(
  "/me",
  authenticate,
  authorizeRoles("PATIENT"),
  updateMyPatientProfile
);

// ==========================================
// PATIENT DASHBOARD
// GET /api/patients/dashboard
// ==========================================
router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("PATIENT"),
  getPatientDashboard
);

module.exports = router;