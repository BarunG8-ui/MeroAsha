const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    genericName: {
      type: String,
      required: true,
      trim: true,
    },

    brandName: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "TABLET",
        "CAPSULE",
        "SYRUP",
        "INJECTION",
        "CREAM",
        "OINTMENT",
        "DROPS",
        "INHALER",
        "OTHER",
      ],
    },

    strength: {
      type: String,
      required: true,
      trim: true,
    },

    dosageForm: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    prescriptionRequired: {
      type: Boolean,
      default: true,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
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

medicineSchema.index({ name: 1 });
medicineSchema.index({ genericName: 1 });
medicineSchema.index({ active: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);