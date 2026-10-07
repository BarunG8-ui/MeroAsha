const mongoose = require("mongoose");

const labRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    tests: [
      {
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LabTest",
          required: true,
        },

        instructions: {
          type: String,
          default: "",
          trim: true,
        },

        status: {
          type: String,
          enum: [
            "REQUESTED",
            "SAMPLE_COLLECTED",
            "PROCESSING",
            "COMPLETED",
            "CANCELLED",
          ],
          default: "REQUESTED",
        },
      },
    ],

    clinicalNotes: {
      type: String,
      default: "",
      trim: true,
    },

    priority: {
      type: String,
      enum: ["NORMAL", "URGENT", "STAT"],
      default: "NORMAL",
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "SAMPLE_COLLECTION",
        "PROCESSING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "REQUESTED",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LabRequest", labRequestSchema);