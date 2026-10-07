const express = require("express");

const {
  createBloodDonation,
  getBloodDonations,
  getBloodDonationById,
  updateBloodDonationStatus,
  acceptBloodDonation,
} = require("../controllers/bloodDonation.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();

// Register a blood donation
router.post(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  createBloodDonation
);

// View all donations
router.get(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  getBloodDonations
);

// View one donation
router.get(
  "/:id",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  getBloodDonationById
);

// Update screening/donation status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  updateBloodDonationStatus
);

// Accept passed donation and add it to inventory
router.patch(
  "/:id/accept",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  acceptBloodDonation
);

module.exports = router;