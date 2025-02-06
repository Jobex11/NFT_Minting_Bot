const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const app = express();
/*

const PORT = process.env.PORT || 3000;
*/
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "🔥 Welcome to the Ultimate NFT Minting Bot! 🚀\n\nChoose an option below:",
    {
      reply_markup: {
        keyboard: [["🎨 NFT Mint"], ["💬 Join Group", "📢 Join Channel"]],
        resize_keyboard: true,
      },
    }
  );
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "🎨 NFT Mint") {
    bot.sendMessage(chatId, "🚀 Select an option:", {
      reply_markup: {
        keyboard: [
          ["🔗 Select RPC"],
          ["🎭 Mint NFT"],
          ["🔑 Wallet Connect"],
          ["📜 Transaction History"],
          ["🔙 Back"],
        ],
        resize_keyboard: true,
      },
    });
  } else if (text === "💬 Join Group") {
    bot.sendMessage(
      chatId,
      "🤝 Join our community: [Group Link](https://t.me/examplegroup)",
      { parse_mode: "Markdown" }
    );
  } else if (text === "📢 Join Channel") {
    bot.sendMessage(
      chatId,
      "📢 Stay updated: [Channel Link](https://t.me/examplechannel)",
      { parse_mode: "Markdown" }
    );
  } else if (text === "🔙 Back") {
    bot.sendMessage(chatId, "🔄 Back to Main Menu:", {
      reply_markup: {
        keyboard: [["🎨 NFT Mint"], ["💬 Join Group", "📢 Join Channel"]],
        resize_keyboard: true,
      },
    });
  }
});

/*
app.listen(PORT, () => {
  console.log(`Bot is running on port ${PORT}`);
});

*/

module.exports = bot;
