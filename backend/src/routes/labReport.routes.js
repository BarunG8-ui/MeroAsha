const express = require("express");

const {
  createLabReport,
  getMyLabReports,
  getLabReportById,
  finalizeLabReport,
} = require("../controllers/labReport.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// Laboratory staff creates report
router.post(
  "/",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "LAB_STAFF"
  ),
  createLabReport
);

// Patient views own reports
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyLabReports
);

// Patient, doctor, admin and lab staff can view report
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "ADMIN",
    "LAB_STAFF"
  ),
  getLabReportById
);

// Laboratory staff/admin finalizes report
router.patch(
  "/:id/finalize",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "LAB_STAFF"
  ),
  finalizeLabReport
);

module.exports = router;