const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

require("dotenv").config();

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Extract Telegram user details from the message object
  const telegramId = String(chatId); // Use chat.id as the unique Telegram identifier
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";
  const username = msg.from.username || "";

  // POST the user details to your API endpoint
  try {
    await axios.post("https://lmnft-mintingbot.onrender.com/api/users", {
      telegramId,
      firstName,
      lastName,
      username,
    });
    console.log("User saved to database");
  } catch (error) {
    console.error("Error saving user:", error.message);
  }

  // Send welcome message
  bot.sendMessage(
    chatId,
    "🔥 Welcome to the Ultimate NFT Minting Bot! 🚀\n\nChoose an option below:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎨 NFT Mint", callback_data: "nft_mint" }],
          [
            { text: "💬 Join Group", url: "https://t.me/+FzW-EwhbQnBkZDE0" },
            { text: "📢 Join Channel", url: "https://t.me/lmnftminter" },
          ],
        ],
      },
    }
  );
});

// Handle button clicks
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "nft_mint") {
    bot.sendMessage(chatId, "🚀 Select an option:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔗 Select RPC", callback_data: "select_rpc" },
            { text: "🎭 Mint NFT", callback_data: "mint_nft" },
          ],
          [{ text: "🔑 Wallet Connect", callback_data: "wallet_connect" }],
          [
            {
              text: "📜 Transaction History",
              callback_data: "transaction_history",
            },
            { text: "🔙 Back", callback_data: "back_to_main" },
          ],
        ],
      },
    });
  } else if (data === "wallet_connect") {
    const connectLink = `https://phantom.app/ul/v1/connect`;

    bot.sendMessage(
      chatId,
      `🔗 Click the link below to connect your Solana wallet:\n\n[Connect Wallet](${connectLink})`,
      { parse_mode: "Markdown" }
    );
  } else if (data === "back_to_main") {
    bot.sendMessage(chatId, "🔄 Back to Main Menu:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎨 NFT Mint", callback_data: "nft_mint" }],
          [
            { text: "💬 Join Group", url: "https://t.me/+FzW-EwhbQnBkZDE0" },
            { text: "📢 Join Channel", url: "https://t.me/lmnftminter" },
          ],
        ],
      },
    });
  }
});

module.exports = bot;
