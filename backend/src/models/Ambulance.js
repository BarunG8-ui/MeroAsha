const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    ambulanceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    ambulanceType: {
      type: String,
      enum: [
        "BASIC_LIFE_SUPPORT",
        "ADVANCED_LIFE_SUPPORT",
        "PATIENT_TRANSPORT",
        "NEONATAL",
      ],
      required: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AmbulanceDriver",
      default: null,
    },

    currentLocation: {
      address: {
        type: String,
        trim: true,
        default: "",
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

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "DISPATCHED",
        "ON_TRIP",
        "RETURNING",
        "MAINTENANCE",
        "UNAVAILABLE",
      ],
      default: "AVAILABLE",
    },

    equipment: [
      {
        type: String,
        trim: true,
      },
    ],

    capacity: {
      type: Number,
      min: 1,
      default: 1,
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

ambulanceSchema.index({ status: 1 });
ambulanceSchema.index({ ambulanceType: 1 });
ambulanceSchema.index({ active: 1 });

module.exports = mongoose.model("Ambulance", ambulanceSchema);