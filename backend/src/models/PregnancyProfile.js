const mongoose = require("mongoose");

const pregnancyProfileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    pregnancyNumber: {
      type: Number,
      min: 1,
      required: true,
    },

    lastMenstrualPeriod: {
      type: Date,
      required: true,
    },

    expectedDeliveryDate: {
      type: Date,
      required: true,
    },

    conceptionDate: {
      type: Date,
      default: null,
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
        "UNKNOWN",
      ],
      default: "UNKNOWN",
    },

    gravida: {
      type: Number,
      min: 0,
      default: 1,
    },

    para: {
      type: Number,
      min: 0,
      default: 0,
    },

    abortions: {
      type: Number,
      min: 0,
      default: 0,
    },

    livingChildren: {
      type: Number,
      min: 0,
      default: 0,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    riskFactors: [
      {
        type: String,
        trim: true,
      },
    ],

    previousPregnancyHistory: {
      type: String,
      trim: true,
      default: "",
    },

    medicalConditions: [
      {
        type: String,
        trim: true,
      },
    ],

    currentMedications: [
      {
        type: String,
        trim: true,
      },
    ],

    allergies: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "DELIVERED",
        "MISCARRIAGE",
        "TERMINATED",
      ],
      default: "ACTIVE",
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

pregnancyProfileSchema.index({ patientId: 1 });
pregnancyProfileSchema.index({ status: 1 });
pregnancyProfileSchema.index({ expectedDeliveryDate: 1 });
pregnancyProfileSchema.index({ riskLevel: 1 });

pregnancyProfileSchema.index(
  { patientId: 1, pregnancyNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "PregnancyProfile",
  pregnancyProfileSchema
);
