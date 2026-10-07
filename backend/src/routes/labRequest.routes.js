const express = require("express");

const {
  createLabRequest,
  getMyLabRequests,
  getLabRequests,
  getLabRequestById,
  updateLabRequestStatus,
} = require("../controllers/labRequest.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// Doctor creates laboratory request
router.post(
  "/",
  authenticate,
  authorizeRoles("DOCTOR"),
  createLabRequest
);

// Patient views own laboratory requests
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyLabRequests
);

// Admin, reception and laboratory staff view requests
router.get(
  "/",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "LAB_STAFF",
    "RECEPTION"
  ),
  getLabRequests
);

// Patient, doctor, lab staff and admin can view a specific request
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "ADMIN",
    "LAB_STAFF"
  ),
  getLabRequestById
);

// Laboratory staff/admin update request status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "LAB_STAFF"
  ),
  updateLabRequestStatus
);

module.exports = router;