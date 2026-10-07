const express = require("express");

const {
  getMyMedicalRecord,
  getMedicalRecordById,
  getPatientMedicalRecord,
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
} = require("../controllers/medicalRecord.controller");

const {
  authenticate,
} = require("../middleware/auth.middleware");

const {
  authorizeRoles,
} = require("../middleware/role.middleware");

const router = express.Router();


/*
============================================================
PATIENT
============================================================
View own medical record.
============================================================
*/

router.get(
  "/me",
  authenticate,
  authorizeRoles("PATIENT"),
  getMyMedicalRecord
);


/*
============================================================
ALL MEDICAL RECORDS
============================================================

Only Doctor/Admin.

============================================================
*/

router.get(
  "/",
  authenticate,
  authorizeRoles(
    "DOCTOR",
    "ADMIN"
  ),
  getMedicalRecords
);


/*
============================================================
CREATE MEDICAL RECORD
============================================================

Only Doctor/Admin.

============================================================
*/

router.post(
  "/",
  authenticate,
  authorizeRoles(
    "DOCTOR",
    "ADMIN"
  ),
  createMedicalRecord
);


/*
============================================================
GET MEDICAL RECORD BY RECORD ID
============================================================

Patient:
    Own record only

Doctor:
    Allowed

Admin:
    Allowed

============================================================
*/

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "ADMIN"
  ),
  getMedicalRecordById
);


/*
============================================================
GET PATIENT MEDICAL RECORD
============================================================

Patient:
    Own record

Doctor:
    Any patient

Admin:
    Any patient

Nurse:
    View only

============================================================
*/

router.get(
  "/patient/:patientId",
  authenticate,
  authorizeRoles(
    "PATIENT",
    "DOCTOR",
    "ADMIN",
    "NURSE"
  ),
  getPatientMedicalRecord
);


/*
============================================================
UPDATE PATIENT MEDICAL RECORD
============================================================

ONLY:
    DOCTOR
    ADMIN

============================================================
*/

router.patch(
  "/patient/:patientId",
  authenticate,
  authorizeRoles(
    "DOCTOR",
    "ADMIN"
  ),
  updateMedicalRecord
);


module.exports = router;