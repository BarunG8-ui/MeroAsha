const express = require("express");

const {
  createAppointment,
  getMyAppointments,
  getAppointments,
  getAppointmentById,
  getAvailableSlots,
  cancelMyAppointment,
  updateAppointmentStatus,
  getDoctorAppointments,
} = require("../controllers/appointment.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();

// ============================================================
// PATIENT → BOOK APPOINTMENT
// ============================================================

router.post(
  "/",
  authenticate,
  authorizeRoles("PATIENT"),
  createAppointment
);

// ============================================================
// PATIENT → GET OWN APPOINTMENTS
// ============================================================

router.get(
  "/my",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyAppointments
);

// ============================================================
// PATIENT → CHECK AVAILABLE TIME SLOTS
// IMPORTANT: keep this BEFORE /:id
// ============================================================

router.get(
  "/availability",
  authenticate,
  authorizeRoles("PATIENT"),
  getAvailableSlots
);

// ============================================================
// DOCTOR → GET OWN APPOINTMENTS
// IMPORTANT: keep this BEFORE /:id
// ============================================================

router.get(
  "/doctor/my",
  authenticate,
  authorizeRoles("DOCTOR"),
  getDoctorAppointments
);

// ============================================================
// ADMIN / RECEPTION → GET ALL
// ============================================================

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "RECEPTION"
  ),
  getAppointments
);

// ============================================================
// GET SINGLE APPOINTMENT
// ============================================================

router.get(
  "/:id",
  authenticate,
  getAppointmentById
);

// ============================================================
// PATIENT → CANCEL
// ============================================================

router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles("PATIENT"),
  cancelMyAppointment
);

// ============================================================
// STAFF → UPDATE STATUS
// ============================================================

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    "ADMIN",
    "RECEPTION",
    "DOCTOR"
  ),
  updateAppointmentStatus
);

module.exports = router;