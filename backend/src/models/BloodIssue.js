const mongoose = require("mongoose");

const bloodIssueAllocationSchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodInventory",
      required: true,
    },

    unitsIssued: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const bloodIssueSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

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

    unitsIssued: {
      type: Number,
      required: true,
      min: 1,
    },

    allocations: {
      type: [bloodIssueAllocationSchema],
      required: true,
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one inventory allocation is required",
      },
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["ISSUED", "CANCELLED"],
      default: "ISSUED",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
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

bloodIssueSchema.index({ bloodRequestId: 1 });
bloodIssueSchema.index({ patientId: 1 });
bloodIssueSchema.index({ bloodGroup: 1, componentType: 1 });
bloodIssueSchema.index({ issuedAt: -1 });
bloodIssueSchema.index({ status: 1 });

module.exports = mongoose.model("BloodIssue", bloodIssueSchema);