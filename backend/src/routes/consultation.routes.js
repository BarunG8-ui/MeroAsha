const express = require("express");

const {
  createConsultation,
  getConsultationById,
  getConsultationByAppointment,
  updateConsultation,
  completeConsultation,
  getPatientConsultations,
} = require("../controllers/consultation.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();


// ============================================================
// PATIENT CONSULTATION HISTORY
// ============================================================

router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getPatientConsultations
);


// ============================================================
// GET CONSULTATION BY APPOINTMENT
// IMPORTANT: Keep this BEFORE /:id
// ============================================================

router.get(
  "/by-appointment/:appointmentId",
  authenticate,
  getConsultationByAppointment
);


// ============================================================
// CREATE / START CONSULTATION
// ============================================================

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "DOCTOR"),
  createConsultation
);


// ============================================================
// GET CONSULTATION BY ID
// ============================================================

router.get(
  "/:id",
  authenticate,
  getConsultationById
);


// ============================================================
// UPDATE CONSULTATION
// ============================================================

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "DOCTOR"),
  updateConsultation
);


// ============================================================
// COMPLETE CONSULTATION
// ============================================================

router.patch(
  "/:id/complete",
  authenticate,
  authorizeRoles("ADMIN", "DOCTOR"),
  completeConsultation
);


module.exports = router;