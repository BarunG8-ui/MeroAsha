const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    queueId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    queueDate: {
      type: Date,
      required: true,
      index: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "WAITING",
        "CALLED",
        "IN_CONSULTATION",
        "COMPLETED",
        "SKIPPED",
        "CANCELLED",
      ],
      default: "WAITING",
      index: true,
    },

    calledAt: {
      type: Date,
      default: null,
    },

    consultationStartedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index(
  {
    doctorId: 1,
    queueDate: 1,
    tokenNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Queue", queueSchema);