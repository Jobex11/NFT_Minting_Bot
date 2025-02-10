const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");
require("dotenv").config();

// Import models
const User = require("../src/models/userModel");

const app = express();
const GROUP_ID = process.env.GROUP_ID; // Your Telegram Group ID
const CHANNEL_ID = process.env.CHANNEL_ID; // Your Telegram Channel ID

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
    "🔥 Welcome to the Ultimate NFT Minting Bot! 🚀\n\nChoose an option below: \n\n Join the group, channel,  and connect your wallet before minting.",
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

// FUNCTION TO CHECK USER IN GROUP
const checkUserMembership = async (userId, chatId) => {
  try {
    const res = await bot.getChatMember(chatId, userId);
    return res.status !== "left" && res.status !== "kicked"; // User is a member
  } catch (error) {
    console.error(`Error checking membership for ${chatId}:`, error.message);
    return false; // Assume not a member if there's an error
  }
};

// Handles button clicks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const telegramId = chatId;

  // NFT MINT
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
                { text: "📢 Join Channel", url: "https://t.me/lmnftminter" },
              ],
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

    // ✅ Show the new menu with NFT minting options
    bot.sendMessage(chatId, "🚀 Select an option:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔗 Select RPC", callback_data: "select_rpc" },
            { text: "🎭 Mint NFT", callback_data: "mint_nft" },
          ],
          [
            {
              text: "🔑 Wallet Management",
              callback_data: "wallet_management",
            },
          ],
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
  }

  //SELECT RPC

  //===>> rpc infos
  else if (data === "select_rpc") {
    bot.sendMessage(chatId, "🌐 Choose an RPC option or enter a custom one:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🟢 Mainnet", callback_data: "rpc_mainnet" },
            { text: "🟢 Devnet", callback_data: "rpc_devnet" },
          ],
          [
            { text: "🔵 Alchemy Mainnet", callback_data: "alchemy_mainnet" },
            { text: "🟡 Quick Node Mainnet", callback_data: "quick_node" },
          ],
          [
            { text: "🔵 Helius Mainnet", callback_data: "helius_mainnet" },
            { text: "🟡 Ankr Mainnet", callback_data: "ankr_node" },
          ],
          [
            {
              text: "🔵 Chainstack Mainnet",
              callback_data: "chainstack_mainnet",
            },
            { text: "🟡 Blast Mainnet", callback_data: "blast_node" },
          ],

          [
            //  { text: "🟡 Testnet", callback_data: "rpc_testnet" },
            { text: "✏️ Enter Custom RPC", callback_data: "rpc_custom" },
          ],
        ],
      },
    });
  } else if (data === "rpc_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: solanaWeb3.clusterApiUrl("mainnet-beta") }
    );
    bot.sendMessage(chatId, "✅ RPC switched to **Mainnet**.");
  } else if (data === "rpc_devnet") {
  /*
  else if (data === "rpc_testnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: solanaWeb3.clusterApiUrl("testnet") }
    );
    bot.sendMessage(chatId, "✅ RPC switched to **Testnet**.");
  }
  */
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: solanaWeb3.clusterApiUrl("devnet") }
    );
    bot.sendMessage(chatId, "✅ RPC switched to **Devnet**.");
  } else if (data === "alchemy_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Alchemy.");
  } else if (data === "quick_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://solana-mainnet.quiknode.pro/YOUR_API_KEY" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Quick Node.");
  } else if (data === "helius_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Helius Mainnet.");
  } else if (data === "ankr_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://rpc.ankr.com/solana" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Ankr Mainnet.");
  } else if (data === "chainstack_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://solana-mainnet.chainstacklabs.com/YOUR_API_KEY" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Chainstack Mainnet.");
  } else if (data === "blast_mainnet") {
    await User.findOneAndUpdate(
      { telegramId: chatId },
      { rpcUrl: "https://solana-mainnet.blastapi.io/YOUR_API_KEY" }
    );
    bot.sendMessage(chatId, "✅ RPC switched to Blast Mainnet.");
  } else if (data === "rpc_custom") {
    bot.sendMessage(chatId, "✏️ Send me the RPC URL you'd like to use.");
  }

  //===>> ENDS

  //WALLET MANAGEMENT
  //BACK
  //TRANSACTION HISTORY

  // WALLET CONNECT
  else if (data === "wallet_connect") {
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
async function fetchSolBalance(walletAddress, rpcUrl) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("devnet")
    );
    //rpc  mainnet-beta
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
