const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");
require("dotenv").config();

const User = require("../src/models/userModel");

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const GROUP_ID = process.env.GROUP_ID; // Your Telegram Group ID
const CHANNEL_ID = process.env.CHANNEL_ID; // Your Telegram Channel ID
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const telegramId = String(chatId);
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";
  const username = msg.from.username || "";

  try {
    let user = await User.findOneAndUpdate(
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

// ✅ Function to check if user is in group
const checkUserMembership = async (userId, chatId) => {
  try {
    const res = await bot.getChatMember(chatId, userId);
    return res.status !== "left" && res.status !== "kicked"; // User is a member
  } catch (error) {
    console.error(`Error checking membership for ${chatId}:`, error.message);
    return false; // Assume not a member if there's an error
  }
};

// ✅ Handle Wallet Connection
bot.on("callback_query", async (callbackQuery) => {
  const { message, data, from } = callbackQuery;
  const chatId = message.chat.id;
  const telegramId = String(chatId);

  if (data === "wallet_connect") {
    bot.sendMessage(chatId, "Please enter your Solana wallet address:");
    bot.once("message", async (msg) => {
      if (!msg.text) return bot.sendMessage(chatId, "Invalid input.");
      const walletAddress = msg.text.trim();

      try {
        await User.findOneAndUpdate(
          { telegramId },
          { walletAddress },
          { new: true }
        );
        bot.sendMessage(chatId, "✅ Wallet connected successfully!");
      } catch (error) {
        bot.sendMessage(chatId, "❌ Error saving wallet.");
      }
    });
  }

  if (data === "nft_mint") {
    const user = await User.findOne({ telegramId });

    if (!user) {
      return bot.sendMessage(
        chatId,
        "❌ User not found. Please restart with /start."
      );
    }

    const isGroupMember = await checkUserMembership(telegramId, GROUP_ID);
    const isChannelMember = await checkUserMembership(telegramId, CHANNEL_ID);

    if (!isGroupMember || !isChannelMember) {
      return bot.sendMessage(
        chatId,
        "⚠️ You must join both the group and channel to use this feature.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💬 Join Group",
                  url: "https://t.me/+FzW-EwhbQnBkZDE0",
                },
              ],
              [{ text: "📢 Join Channel", url: "https://t.me/lmnftminter" }],
            ],
          },
        }
      );
    }

    if (!user.walletAddress) {
      return bot.sendMessage(
        chatId,
        "⚠️ Please connect your wallet before minting."
      );
    }

    bot.sendMessage(chatId, "✅ All requirements met! Minting NFT...");
    // Add NFT minting here

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




  }
});

module.exports = bot;
