const express = require("express");

const {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  cancelPrescription,
} = require("../controllers/prescription.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Doctor creates prescription
router.post(
  "/",
  authenticate,
  authorizeRoles("DOCTOR"),
  createPrescription
);

// Patient views own prescriptions
router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyPrescriptions
);

// View individual prescription
router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "PHARMACIST",
    "ADMIN"
  ),
  getPrescriptionById
);

// Doctor/Admin cancels prescription
router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles("DOCTOR", "ADMIN"),
  cancelPrescription
);

module.exports = router;