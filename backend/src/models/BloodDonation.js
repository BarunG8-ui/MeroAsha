const mongoose = require("mongoose");

const bloodDonationSchema = new mongoose.Schema(
  {
    donationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    donorName: {
      type: String,
      required: true,
      trim: true,
    },

    donorPhone: {
      type: String,
      required: true,
      trim: true,
    },

    donorBloodGroup: {
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

    unitsDonated: {
      type: Number,
      required: true,
      min: 1,
    },

    donationDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    screeningStatus: {
      type: String,
      enum: [
        "PENDING",
        "PASSED",
        "FAILED",
      ],
      default: "PENDING",
    },

    donationStatus: {
      type: String,
      enum: [
        "REGISTERED",
        "SCREENING",
        "ACCEPTED",
        "REJECTED",
        "USED",
        "EXPIRED",
      ],
      default: "REGISTERED",
    },

    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

bloodDonationSchema.index({
  donorBloodGroup: 1,
  componentType: 1,
});

bloodDonationSchema.index({
  donationDate: -1,
});

bloodDonationSchema.index({
  donationStatus: 1,
});

module.exports = mongoose.model(
  "BloodDonation",
  bloodDonationSchema
);