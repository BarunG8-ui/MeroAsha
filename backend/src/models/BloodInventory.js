const mongoose = require("mongoose");

const bloodInventorySchema = new mongoose.Schema(
  {
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

    unitsAvailable: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    minimumRequiredUnits: {
      type: Number,
      required: true,
      min: 0,
      default: 5,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    storageLocation: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "LOW_STOCK",
        "EXPIRED",
        "UNAVAILABLE",
      ],
      default: "AVAILABLE",
    },

    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

bloodInventorySchema.index({
  bloodGroup: 1,
  componentType: 1,
});

bloodInventorySchema.index({
  expiryDate: 1,
});

bloodInventorySchema.index({
  status: 1,
});

module.exports = mongoose.model(
  "BloodInventory",
  bloodInventorySchema
);