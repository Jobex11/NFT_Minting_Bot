const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String },
  createdAt: { type: Date, default: Date.now },

  // WALLET FUNCTIONALITITES
  connectedWallet: { type: String },
  walletAddress: { type: String },

  // other functionalities
});

module.exports = mongoose.model("User", userSchema);
