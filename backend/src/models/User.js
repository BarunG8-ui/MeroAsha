const mongoose = require("mongoose");

const USER_ROLES = [
  "PATIENT",
  "DOCTOR",
  "NURSE",
  "RECEPTION",
  "LAB_STAFF",
  "PHARMACIST",
  "BLOOD_BANK_STAFF",
  "EMERGENCY_STAFF",
  "ADMIN"
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    phone: {
      type: String,
      trim: true,
      default: null
    },

    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      default: "PATIENT"
    },

    active: {
      type: Boolean,
      default: true
    },

    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);