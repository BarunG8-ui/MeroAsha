const mongoose = require("mongoose");

/*
============================================================
MEROASHA HOSPITAL MANAGEMENT SYSTEM
Medical Record Model
============================================================

PATIENT:
    View own record

DOCTOR:
    View + Edit

ADMIN:
    View + Edit

NURSE:
    View

RECEPTION:
    No clinical editing

============================================================
*/

const medicalRecordSchema = new mongoose.Schema(
  {
    // ========================================================
    // PATIENT
    // ========================================================

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
      index: true,
    },

    // ========================================================
    // ALLERGIES
    // ========================================================

    allergies: [
      {
        type: String,
        trim: true,
      },
    ],

    // ========================================================
    // CHRONIC CONDITIONS
    // ========================================================

    chronicConditions: [
      {
        type: String,
        trim: true,
      },
    ],

    // ========================================================
    // CURRENT MEDICATIONS
    // ========================================================

    currentMedications: [
      {
        name: {
          type: String,
          trim: true,
          default: "",
        },

        dosage: {
          type: String,
          trim: true,
          default: "",
        },

        frequency: {
          type: String,
          trim: true,
          default: "",
        },

        startedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // ========================================================
    // MEDICAL HISTORY
    // ========================================================

    pastMedicalHistory: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================================
    // SURGICAL HISTORY
    // ========================================================

    surgicalHistory: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================================
    // FAMILY HISTORY
    // ========================================================

    familyHistory: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================================
    // MEDICAL NOTES
    // ========================================================

    medicalNotes: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================================
    // IMPORTANT INFORMATION
    // ========================================================

    importantInformation: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================================
    // WHO LAST UPDATED THE RECORD
    // ========================================================

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


// ============================================================
// INDEX
// ============================================================

medicalRecordSchema.index(
  { patientId: 1 },
  { unique: true }
);


// ============================================================
// MODEL
// ============================================================

const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);


// ============================================================
// EXPORT
// ============================================================

module.exports = MedicalRecord;