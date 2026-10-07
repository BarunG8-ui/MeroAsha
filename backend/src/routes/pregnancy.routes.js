const express = require("express");

const {
  createPregnancyProfile,
  getMyPregnancyProfile,
  getPregnancyProfileById,
  updatePregnancyProfile,
  createPregnancyVisit,
  getPregnancyVisits,
} = require("../controllers/pregnancy.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Patient creates pregnancy profile
router.post(
  "/",
  authenticate,
  authorizeRoles("PATIENT"),
  createPregnancyProfile
);

// Patient views own pregnancy profile
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyPregnancyProfile
);

// View pregnancy profile
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "NURSE",
    "RECEPTION",
    "ADMIN"
  ),
  getPregnancyProfileById
);

// Update pregnancy profile
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    "DOCTOR",
    "NURSE",
    "ADMIN"
  ),
  updatePregnancyProfile
);

// Record antenatal visit
router.post(
  "/visits",
  authenticate,
  authorizeRoles(
    "DOCTOR",
    "NURSE",
    "ADMIN"
  ),
  createPregnancyVisit
);

// Get pregnancy visit history
router.get(
  "/:id/visits",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "NURSE",
    "ADMIN"
  ),
  getPregnancyVisits
);

module.exports = router;
