const mongoose = require("mongoose");

const ambulanceDriverSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    licenseExpiryDate: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    availabilityStatus: {
      type: String,
      enum: [
        "AVAILABLE",
        "ON_DUTY",
        "ON_TRIP",
        "OFF_DUTY",
        "UNAVAILABLE",
      ],
      default: "AVAILABLE",
    },

    active: {
      type: Boolean,
      default: true,
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

ambulanceDriverSchema.index({ availabilityStatus: 1 });
ambulanceDriverSchema.index({ active: 1 });

module.exports = mongoose.model(
  "AmbulanceDriver",
  ambulanceDriverSchema
);