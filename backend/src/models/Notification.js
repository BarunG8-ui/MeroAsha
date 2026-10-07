const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "APPOINTMENT",
        "QUEUE",
        "CONSULTATION",
        "LAB",
        "PHARMACY",
        "BLOOD_BANK",
        "AMBULANCE",
        "PREGNANCY",
        "SYSTEM",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  recipientId: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipientId: 1,
  read: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);
