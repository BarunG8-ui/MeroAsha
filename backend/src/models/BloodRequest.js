const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ],
    },

    componentType: {
      type: String,
      required: true,
      enum: [
        "WHOLE_BLOOD",
        "RED_CELLS",
        "PLASMA",
        "PLATELETS",
        "CRYOPRECIPITATE",
      ],
    },

    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },

    urgency: {
      type: String,
      enum: [
        "NORMAL",
        "URGENT",
        "EMERGENCY",
      ],
      default: "NORMAL",
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    requiredBy: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "APPROVED",
        "PARTIALLY_FULFILLED",
        "FULFILLED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "REQUESTED",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    fulfilledAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.index({
  patientId: 1,
});

bloodRequestSchema.index({
  bloodGroup: 1,
  componentType: 1,
});

bloodRequestSchema.index({
  status: 1,
});

bloodRequestSchema.index({
  urgency: 1,
});

bloodRequestSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "BloodRequest",
  bloodRequestSchema
);