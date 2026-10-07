const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    consultationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
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

    // Department associated with this consultation
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },

    symptoms: {
      type: String,
      default: "",
      trim: true,
    },

    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },

    clinicalNotes: {
      type: String,
      default: "",
      trim: true,
    },

    vitalSigns: {
      temperature: {
        type: Number,
        default: null,
      },

      bloodPressure: {
        type: String,
        default: "",
        trim: true,
      },

      heartRate: {
        type: Number,
        default: null,
      },

      respiratoryRate: {
        type: Number,
        default: null,
      },

      oxygenSaturation: {
        type: Number,
        default: null,
      },

      weight: {
        type: Number,
        default: null,
      },

      height: {
        type: Number,
        default: null,
      },
    },

    followUpRequired: {
      type: Boolean,
      default: false,
    },

    followUpDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "IN_PROGRESS",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
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

// Indexes for faster hospital queries
consultationSchema.index({
  patientId: 1,
  createdAt: -1,
});

consultationSchema.index({
  doctorId: 1,
  createdAt: -1,
});

consultationSchema.index({
  departmentId: 1,
  createdAt: -1,
});

consultationSchema.index({
  status: 1,
});

module.exports = mongoose.model(
  "Consultation",
  consultationSchema
);