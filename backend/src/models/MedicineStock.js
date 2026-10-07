const mongoose = require("mongoose");

const medicineStockSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    supplier: {
      type: String,
      trim: true,
      default: "",
    },

    receivedDate: {
      type: Date,
      default: Date.now,
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

medicineStockSchema.index({
  medicineId: 1,
  batchNumber: 1,
});

medicineStockSchema.index({
  expiryDate: 1,
});

module.exports = mongoose.model(
  "MedicineStock",
  medicineStockSchema
);