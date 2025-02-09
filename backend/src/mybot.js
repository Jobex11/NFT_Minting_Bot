const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");
require("dotenv").config();

// Import models
const User = require("../src/models/userModel");

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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

// Handles button clicks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "wallet_connect") {
    const user = await User.findOne({ telegramId: chatId });

    if (user && user.walletAddress) {
      // User already has a wallet, show wallet info
      const balance = await fetchSolBalance(user.walletAddress);
      bot.sendMessage(
        chatId,
        `✅ Wallet Connected!\n\n🔹 **Address:** \`${user.walletAddress}\`\n💰 **Balance:** \`${balance} SOL\`\n🔐 **Private Key:** \`${user.privateKey}\``,
        { parse_mode: "Markdown" }
      );
    } else {
      // Ask user how they want to connect their wallet
      bot.sendMessage(
        chatId,
        "How would you like to connect your Solana wallet?",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔑 Import Existing Wallet",
                  callback_data: "import_wallet",
                },
              ],
              [
                {
                  text: "🆕 Create New Wallet",
                  callback_data: "create_wallet",
                },
              ],
            ],
          },
        }
      );
    }
  } else if (data === "create_wallet") {
    const newWallet = solanaWeb3.Keypair.generate();
    const publicKey = newWallet.publicKey.toBase58();
    const privateKey = bs58.encode(newWallet.secretKey);

    try {
      const user = await User.findOneAndUpdate(
        { telegramId: chatId },
        { walletAddress: publicKey, privateKey: privateKey },
        { upsert: true, new: true }
      );

      console.log("New Wallet Created & Saved:", user);

      bot.sendMessage(
        chatId,
        `✅ **Wallet Created!**\n\n🔹 **Address:** \`${publicKey}\`\n🔐 **Private Key (Keep Safe!):** \`${privateKey}\``,
        { parse_mode: "Markdown" }
      );

      // Fetch balance
      const balance = await fetchSolBalance(publicKey);
      bot.sendMessage(chatId, `💰 **Your SOL Balance:** \`${balance} SOL\``, {
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.error("Error saving wallet:", error);
      bot.sendMessage(chatId, "❌ Failed to save wallet. Please try again.");
    }
  } else if (data === "import_wallet") {
    bot.sendMessage(
      chatId,
      "Send me your **private key** to import your wallet.",
      { parse_mode: "Markdown" }
    );
  }
});

// Handle private key input
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (
    text.startsWith("/") ||
    (await User.findOne({ telegramId: chatId, walletAddress: { $ne: null } }))
  )
    return;

  try {
    let secretKey;

    // Detect if input is Base58 or Uint8Array format
    if (text.includes(",")) {
      secretKey = Uint8Array.from(text.split(",").map(Number));
    } else {
      secretKey = bs58.decode(text);
    }

    const importedWallet = solanaWeb3.Keypair.fromSecretKey(secretKey);
    const publicKey = importedWallet.publicKey.toBase58();
    const privateKey = bs58.encode(secretKey);

    // Save wallet to database
    const user = await User.findOneAndUpdate(
      { telegramId: chatId },
      { walletAddress: publicKey, privateKey: privateKey },
      { upsert: true, new: true }
    );

    console.log("Wallet Imported & Saved:", user);

    const balance = await fetchSolBalance(publicKey);
    bot.sendMessage(
      chatId,
      `✅ **Wallet Imported!**\n\n🔹 **Address:** \`${publicKey}\`\n🔐 **Private Key:** \`${privateKey}\`\n💰 **Your SOL Balance:** \`${balance} SOL\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Import Error:", error);
    bot.sendMessage(chatId, "❌ Invalid private key! Please try again.");
  }
});

// Fetch SOL balance
async function fetchSolBalance(walletAddress) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta")
    );
    const balance = await connection.getBalance(
      new solanaWeb3.PublicKey(walletAddress)
    );
    return (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4); // 4 decimal places
  } catch (error) {
    console.error("Error fetching balance:", error);
    return "0"; // Return zero if fetch fails
  }
}

console.log("Bot is running...");

module.exports = bot;

/*
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

require("dotenv").config();

const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  const telegramId = String(chatId);
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";
  const username = msg.from.username || "";

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

*/
