const mongoose = require("mongoose");

const labTestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "BLOOD",
        "URINE",
        "IMAGING",
        "BIOCHEMISTRY",
        "MICROBIOLOGY",
        "PATHOLOGY",
        "OTHER",
      ],
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    sampleType: {
      type: String,
      default: "",
      trim: true,
    },

    preparationRequired: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    turnaroundTime: {
      type: String,
      default: "",
      trim: true,
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

module.exports = mongoose.model("LabTest", labTestSchema);