const express = require("express");

const {
  createBloodInventory,
  getBloodInventory,
  getAvailableBloodInventory,
  getBloodInventoryById,
  updateBloodInventory,
  adjustBloodInventory,
  updateExpiredInventory,
} = require("../controllers/bloodInventory.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// CREATE INVENTORY
// ============================================================

router.post(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  createBloodInventory
);

// ============================================================
// GET ALL INVENTORY
// ============================================================

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "BLOOD_BANK_STAFF",
    "ADMIN",
    "DOCTOR",
    "EMERGENCY_STAFF"
  ),
  getBloodInventory
);

// ============================================================
// GET AVAILABLE INVENTORY
// ============================================================

router.get(
  "/available",
  authenticate,
  authorizeRoles(
    "BLOOD_BANK_STAFF",
    "ADMIN",
    "DOCTOR",
    "EMERGENCY_STAFF"
  ),
  getAvailableBloodInventory
);

// ============================================================
// UPDATE EXPIRED INVENTORY
// ============================================================

router.patch(
  "/update-expired",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  updateExpiredInventory
);

// ============================================================
// GET INVENTORY BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "BLOOD_BANK_STAFF",
    "ADMIN",
    "DOCTOR",
    "EMERGENCY_STAFF"
  ),
  getBloodInventoryById
);

// ============================================================
// UPDATE INVENTORY DETAILS
// ============================================================

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  updateBloodInventory
);

// ============================================================
// ADJUST INVENTORY QUANTITY
// ============================================================

router.patch(
  "/:id/quantity",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  adjustBloodInventory
);

module.exports = router;