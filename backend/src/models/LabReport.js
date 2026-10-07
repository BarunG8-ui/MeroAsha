const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    labRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabRequest",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabTest",
      required: true,
    },

    result: {
      type: String,
      default: "",
      trim: true,
    },

    unit: {
      type: String,
      default: "",
      trim: true,
    },

    referenceRange: {
      type: String,
      default: "",
      trim: true,
    },

    interpretation: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    reportStatus: {
      type: String,
      enum: ["DRAFT", "FINAL"],
      default: "DRAFT",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reportedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LabReport", labReportSchema);