const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["businessOwner", "manager", "user"], required: true },
  subscription: {
    active: { type: Boolean, default: false },
    plan: { type: String, default: null }, // basic an premium
    expiresAt: { type: Date, default: null }
  }
});

module.exports = mongoose.model("User", userSchema);