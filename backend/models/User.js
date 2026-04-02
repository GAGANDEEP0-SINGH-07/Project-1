const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "Global",
    },
    tagline: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Indexes for performance optimization
userSchema.index({ following: 1 });
userSchema.index({ followers: 1 });

module.exports = mongoose.model("User", userSchema);
