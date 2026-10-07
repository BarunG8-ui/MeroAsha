const express = require("express");

const {
  authenticate
} = require("../middleware/auth.middleware");

const {
  authorizeRoles
} = require("../middleware/role.middleware");

const router = express.Router();


// Any authenticated user
router.get(
  "/protected",
  authenticate,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "You accessed a protected MeroAsha route",
      user: req.user
    });
  }
);


// Patient only
router.get(
  "/patient",
  authenticate,
  authorizeRoles("PATIENT"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Patient-only route accessed",
      user: req.user
    });
  }
);


// Doctor only
router.get(
  "/doctor",
  authenticate,
  authorizeRoles("DOCTOR"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Doctor-only route accessed",
      user: req.user
    });
  }
);


// Admin only
router.get(
  "/admin",
  authenticate,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin-only route accessed",
      user: req.user
    });
  }
);


module.exports = router;