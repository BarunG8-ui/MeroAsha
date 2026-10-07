const express = require("express");

const {
  createEmergencyRequest,
  getEmergencyRequests,
  getMyEmergencyRequests,
  getEmergencyRequestById,
  getAvailableEmergencyAmbulances,
  dispatchEmergency,
  updateEmergencyStatus,
} = require("../controllers/emergency.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Create emergency request
router.post(
  "/",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "RECEPTION",
    "EMERGENCY_STAFF",
    "ADMIN"
  ),
  createEmergencyRequest
);

// Patient's own emergency requests
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyEmergencyRequests
);

// Available ambulances
router.get(
  "/available-ambulances",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getAvailableEmergencyAmbulances
);

// All emergency requests
router.get(
  "/",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getEmergencyRequests
);

// Dispatch ambulance
router.patch(
  "/:id/dispatch",
  authenticate,
  authorizeRoles("ADMIN", "EMERGENCY_STAFF"),
  dispatchEmergency
);

// Update emergency status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN", "EMERGENCY_STAFF"),
  updateEmergencyStatus
);

// Get single emergency
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getEmergencyRequestById
);

module.exports = router;