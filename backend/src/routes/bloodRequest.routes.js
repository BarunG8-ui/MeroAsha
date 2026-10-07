const express = require("express");

const {
  createBloodRequest,
  getBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
} = require("../controllers/bloodRequest.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// PATIENT
// ============================================================

// Patient creates a blood request for their own profile
router.post(
  "/",
  authenticate,
  authorizeRoles("PATIENT"),
  createBloodRequest
);

// Patient views their own blood requests
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyBloodRequests
);

// ============================================================
// BLOOD BANK STAFF / ADMIN
// ============================================================

// Blood Bank staff and administrators view all requests
router.get(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  getBloodRequests
);

// View a specific request
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "BLOOD_BANK_STAFF",
    "ADMIN"
  ),
  getBloodRequestById
);

// Update request status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    "BLOOD_BANK_STAFF",
    "ADMIN"
  ),
  updateBloodRequestStatus
);

module.exports = router;