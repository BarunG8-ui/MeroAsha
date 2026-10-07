const express = require("express");

const {
  getDoctors,
  getDoctorById,
  getDoctorsByDepartment,
  updateDoctorStatus,
} = require("../controllers/doctor.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// GET ALL DOCTORS
// ============================================================

router.get(
  "/",
  authenticate,
  getDoctors
);

// ============================================================
// GET DOCTORS BY DEPARTMENT
// IMPORTANT: Keep this BEFORE /:id
// ============================================================

router.get(
  "/department/:departmentId",
  authenticate,
  getDoctorsByDepartment
);

// ============================================================
// GET SINGLE DOCTOR
// ============================================================

router.get(
  "/:id",
  authenticate,
  getDoctorById
);

// ============================================================
// ADMIN → UPDATE DOCTOR STATUS
// ============================================================

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateDoctorStatus
);

module.exports = router;