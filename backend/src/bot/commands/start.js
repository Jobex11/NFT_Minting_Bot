const bot = require("../bot");
const User = require("../models/userModel");

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const telegramId = String(chatId);
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";
  const username = msg.from.username || "";

  try {
    await User.findOneAndUpdate(
      { telegramId },
      { telegramId, firstName, lastName, username },
      { upsert: true, new: true }
    );
    console.log("User saved to database");
  } catch (error) {
    console.error("Error saving user:", error.message);
  }

  bot.sendMessage(
    chatId,
    "🔥 Welcome to the Ultimate NFT Minting Bot! 🚀\n\nChoose an option below:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎨 NFT Mint", callback_data: "nft_mint" }],
          [{ text: "🔑 Wallet Connect", callback_data: "wallet_connect" }],
          [
            { text: "💬 Join Group", url: "https://t.me/+FzW-EwhbQnBkZDE0" },
            { text: "📢 Join Channel", url: "https://t.me/lmnftminter" },
          ],
        ],
      },
    }
  );
});
