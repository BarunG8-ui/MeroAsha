const express = require("express");

const {
  createQueue,
  getDoctorQueue,
  getMyQueue,
  callNextPatient,
  startConsultation,
  completeQueue,
} = require("../controllers/queue.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();


// ============================================================
// CREATE QUEUE
// ============================================================

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "RECEPTION", "PATIENT"),
  createQueue
);


// ============================================================
// PATIENT - MY QUEUE
// ============================================================

router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyQueue
);


// ============================================================
// DOCTOR - QUEUE
// ============================================================

router.get(
  "/doctor/:doctorId",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTION"
  ),
  getDoctorQueue
);


// ============================================================
// DOCTOR - CALL NEXT PATIENT
// ============================================================

router.patch(
  "/doctor/:doctorId/next",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "DOCTOR",
    "NURSE"
  ),
  callNextPatient
);


// ============================================================
// START CONSULTATION
// ============================================================

router.patch(
  "/:id/start",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "DOCTOR",
    "NURSE"
  ),
  startConsultation
);


// ============================================================
// COMPLETE QUEUE
// ============================================================

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "DOCTOR",
    "NURSE"
  ),
  completeQueue
);


module.exports = router;