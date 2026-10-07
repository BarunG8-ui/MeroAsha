const express = require("express");

const {
  issueBlood,
  getBloodIssues,
  getMyBloodIssues,
  getBloodIssueById,
} = require("../controllers/bloodIssue.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// ISSUE BLOOD
// ============================================================

router.post(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  issueBlood
);

// ============================================================
// GET ALL BLOOD ISSUES
// ============================================================

router.get(
  "/",
  authenticate,
  authorizeRoles("BLOOD_BANK_STAFF", "ADMIN"),
  getBloodIssues
);

// ============================================================
// GET MY BLOOD ISSUES
// ============================================================

router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyBloodIssues
);

// ============================================================
// GET BLOOD ISSUE BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "BLOOD_BANK_STAFF",
    "ADMIN"
  ),
  getBloodIssueById
);

module.exports = router;