const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    regNo: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    userRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    roundQualified: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    submissionTime: {
      type: Date,
      default: new Date("2025"),
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model("User", userSchema);
module.exports = User;

