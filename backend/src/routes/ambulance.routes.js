const express = require("express");

const {
  createAmbulance,
  getAmbulances,
  getAvailableAmbulances,
  getAmbulanceById,
  updateAmbulance,
  assignDriver,
  removeDriver,
  updateAmbulanceStatus,
  updateAmbulanceLocation,
  createDriver,
  getDrivers,
  updateDriver,
} = require("../controllers/ambulance.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// --------------------------------------------------
// AMBULANCES
// --------------------------------------------------

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "EMERGENCY_STAFF"),
  createAmbulance
);

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getAmbulances
);

// IMPORTANT:
// /available must come before /:id
router.get(
  "/available",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getAvailableAmbulances
);

// --------------------------------------------------
// AMBULANCE DRIVERS
// --------------------------------------------------

// IMPORTANT:
// /drivers must come before /:id
router.post(
  "/drivers",
  authenticate,
  authorizeRoles("ADMIN", "EMERGENCY_STAFF"),
  createDriver
);

router.get(
  "/drivers",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getDrivers
);

router.patch(
  "/drivers/:id",
  authenticate,
  authorizeRoles("ADMIN", "EMERGENCY_STAFF"),
  updateDriver
);

// --------------------------------------------------
// AMBULANCE BY ID
// --------------------------------------------------

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF",
    "RECEPTION"
  ),
  getAmbulanceById
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF"
  ),
  updateAmbulance
);

router.patch(
  "/:id/driver",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF"
  ),
  assignDriver
);

router.delete(
  "/:id/driver",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF"
  ),
  removeDriver
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF"
  ),
  updateAmbulanceStatus
);

router.patch(
  "/:id/location",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "EMERGENCY_STAFF"
  ),
  updateAmbulanceLocation
);

module.exports = router;