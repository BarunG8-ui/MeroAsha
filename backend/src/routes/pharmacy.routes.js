const express = require("express");

const {
  getActivePrescriptions,
  dispensePrescription,
  getPharmacyTransactionById,
  getMyPharmacyHistory,
} = require("../controllers/pharmacy.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// PHARMACY STAFF
// ============================================================

// View prescriptions waiting for dispensing
router.get(
  "/prescriptions",
  authenticate,
  authorizeRoles("PHARMACIST", "ADMIN"),
  getActivePrescriptions
);

// Dispense a prescription
router.post(
  "/dispense",
  authenticate,
  authorizeRoles("PHARMACIST", "ADMIN"),
  dispensePrescription
);

// View a pharmacy transaction
router.get(
  "/transactions/:id",
  authenticate,
  authorizeRoles(
    "PHARMACIST",
    "ADMIN",
    "PATIENT"
  ),
  getPharmacyTransactionById
);

// ============================================================
// PATIENT
// ============================================================

// Patient views pharmacy history
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyPharmacyHistory
);

module.exports = router;