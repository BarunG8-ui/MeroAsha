const mongoose = require("mongoose");

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    medicineName: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
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

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      default: null,
    },

    medicines: {
      type: [prescriptionItemSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one medicine is required",
      },
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "DISPENSED",
        "PARTIALLY_DISPENSED",
        "CANCELLED",
      ],
      default: "ACTIVE",
    },

    prescribedAt: {
      type: Date,
      default: Date.now,
    },

    dispensedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ doctorId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ prescribedAt: -1 });

module.exports = mongoose.model(
  "Prescription",
  prescriptionSchema
);