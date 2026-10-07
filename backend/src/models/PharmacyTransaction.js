const mongoose = require("mongoose");

const pharmacyItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicineStock",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const pharmacyTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [pharmacyItemSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one pharmacy item is required",
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "PARTIALLY_PAID",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    dispensingStatus: {
      type: String,
      enum: [
        "DISPENSED",
        "PARTIALLY_DISPENSED",
        "CANCELLED",
      ],
      default: "DISPENSED",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    dispensedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

pharmacyTransactionSchema.index({
  prescriptionId: 1,
});

pharmacyTransactionSchema.index({
  patientId: 1,
});

pharmacyTransactionSchema.index({
  dispensedAt: -1,
});

module.exports = mongoose.model(
  "PharmacyTransaction",
  pharmacyTransactionSchema
);