const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true },
    username: { type: String },
    connectedWallet: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
