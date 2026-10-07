const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
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

    phone: {
      type: String,
    },

    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },

    allergies: [
      {
        type: String,
      },
    ],

    chronicConditions: [
      {
        type: String,
      },
    ],

    currentMedications: [
      {
        type: String,
      },
    ],

    medicalNotes: {
      type: String,
    },

    insurance: {
      provider: String,
      policyNumber: String,
      validUntil: Date,
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

module.exports = mongoose.model("Patient", patientSchema);