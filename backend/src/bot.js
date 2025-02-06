const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🔥 Welcome to the Ultimate NFT Minting Bot! 🚀\n\nChoose an option below:",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎨 NFT Mint", callback_data: "nft_mint" }],
          [
            { text: "💬 Join Group", url: "https://t.me/examplegroup" },
            { text: "📢 Join Channel", url: "https://t.me/examplechannel" },
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
          [{ text: "🔗 Select RPC", callback_data: "select_rpc" }],
          [{ text: "🎭 Mint NFT", callback_data: "mint_nft" }],
          [{ text: "🔑 Wallet Connect", callback_data: "wallet_connect" }],
          [
            {
              text: "📜 Transaction History",
              callback_data: "transaction_history",
            },
          ],
          [{ text: "🔙 Back", callback_data: "back_to_main" }],
        ],
      },
    });
  } else if (data === "back_to_main") {
    bot.sendMessage(chatId, "🔄 Back to Main Menu:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎨 NFT Mint", callback_data: "nft_mint" }],
          [
            { text: "💬 Join Group", url: "https://t.me/examplegroup" },
            { text: "📢 Join Channel", url: "https://t.me/examplechannel" },
          ],
        ],
      },
    });
  }
});

module.exports = bot;
