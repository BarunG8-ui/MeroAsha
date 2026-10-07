const mongoose = require("mongoose");

const pregnancyVisitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    pregnancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PregnancyProfile",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    gestationalAgeWeeks: {
      type: Number,
      min: 0,
      max: 45,
      default: 0,
    },

    weightKg: {
      type: Number,
      min: 0,
      default: null,
    },

    bloodPressure: {
      systolic: {
        type: Number,
        min: 0,
        default: null,
      },
      diastolic: {
        type: Number,
        min: 0,
        default: null,
      },
    },

    pulseRate: {
      type: Number,
      min: 0,
      default: null,
    },

    temperatureC: {
      type: Number,
      default: null,
    },

    fetalHeartRate: {
      type: Number,
      min: 0,
      default: null,
    },

    fundalHeightCm: {
      type: Number,
      min: 0,
      default: null,
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    examinationNotes: {
      type: String,
      trim: true,
      default: "",
    },

    investigations: [
      {
        type: String,
        trim: true,
      },
    ],

    medications: [
      {
        type: String,
        trim: true,
      },
    ],

    riskAssessment: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    recommendations: {
      type: String,
      trim: true,
      default: "",
    },

    nextVisitDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

pregnancyVisitSchema.index({ pregnancyId: 1, visitDate: -1 });
pregnancyVisitSchema.index({ patientId: 1, visitDate: -1 });
pregnancyVisitSchema.index({ doctorId: 1, visitDate: -1 });

module.exports = mongoose.model(
  "PregnancyVisit",
  pregnancyVisitSchema
);
