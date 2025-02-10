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
  walletAddress: { type: String },
  privatekey: { type: String }, //store private key  securely(consider encrypting)

  // other functionalities
  joined_channel: { type: Boolean },
  joined_group: { type: Boolean },

  //
  rpcUrl: { type: String },
});

module.exports = mongoose.model("User", userSchema);
