const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
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

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "BOOKED",
        "CONFIRMED",
        "CHECKED_IN",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "BOOKED",
    },

    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    checkedInAt: {
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

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({
  patientId: 1,
  appointmentDate: -1,
});

appointmentSchema.index({
  doctorId: 1,
  appointmentDate: 1,
});

appointmentSchema.index({
  departmentId: 1,
  appointmentDate: 1,
});

appointmentSchema.index({
  status: 1,
  appointmentDate: 1,
});

module.exports = mongoose.model(
  "Appointment",
  appointmentSchema
);