const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    emergencyId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    patientPhone: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyType: {
      type: String,
      enum: [
        "ACCIDENT",
        "CARDIAC",
        "RESPIRATORY",
        "TRAUMA",
        "PREGNANCY",
        "PEDIATRIC",
        "OTHER",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true,
    },

    pickupLocation: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },
    },

    destinationHospital: {
      type: String,
      required: true,
      trim: true,
    },

    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AmbulanceDriver",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "REQUESTED",
        "DISPATCHED",
        "EN_ROUTE",
        "ARRIVED",
        "PATIENT_PICKED_UP",
        "AT_HOSPITAL",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "REQUESTED",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    dispatchedAt: {
      type: Date,
      default: null,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    medicalNotes: {
      type: String,
      trim: true,
      default: "",
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

emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ severity: 1 });
emergencyRequestSchema.index({ patientId: 1 });
emergencyRequestSchema.index({ ambulanceId: 1 });
emergencyRequestSchema.index({ requestedAt: -1 });

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);