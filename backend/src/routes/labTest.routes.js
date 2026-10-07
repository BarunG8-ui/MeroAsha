const express = require("express");

const {
  createLabTest,
  getLabTests,
  getLabTestById,
  updateLabTest,
} = require("../controllers/labTest.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// Get all laboratory tests
router.get(
  "/",
  authenticate,
  getLabTests
);

// Get laboratory test by ID
router.get(
  "/:id",
  authenticate,
  getLabTestById
);

// Create laboratory test
router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createLabTest
);

// Update laboratory test
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updateLabTest
);

module.exports = router;