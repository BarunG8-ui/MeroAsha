const express = require("express");

const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
} = require("../controllers/medicine.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

/*
 * Medicine Management
 */

/*
 * Create medicine
 * ADMIN / PHARMACIST
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST"),
  createMedicine
);

/*
 * Get all medicines
 * ADMIN / PHARMACIST / DOCTOR
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedicines
);

/*
 * Get medicine by ID
 * ADMIN / PHARMACIST / DOCTOR
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST", "DOCTOR"),
  getMedicineById
);

/*
 * Update medicine
 * ADMIN / PHARMACIST
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "PHARMACIST"),
  updateMedicine
);

module.exports = router;