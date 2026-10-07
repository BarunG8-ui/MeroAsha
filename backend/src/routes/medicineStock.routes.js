const express = require("express");

const {
  addMedicineStock,
  getMedicineStock,
  getMedicineStockById,
  updateMedicineStock,
  updateStockQuantity,
} = require("../controllers/medicineStock.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// MEDICINE STOCK
// ============================================================

// Add new medicine stock
// ADMIN / PHARMACIST
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST"),
  addMedicineStock
);

// Get all medicine stock
// ADMIN / PHARMACIST / DOCTOR
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedicineStock
);

// Get stock by ID
// ADMIN / PHARMACIST / DOCTOR
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedicineStockById
);

// Update stock information
// ADMIN / PHARMACIST
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST"),
  updateMedicineStock
);

// Update available quantity
// ADMIN / PHARMACIST
router.patch(
  "/:id/quantity",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST"),
  updateStockQuantity
);

module.exports = router;