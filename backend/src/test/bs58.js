const TelegramBot = require("node-telegram-bot-api");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");

// Replace with your Telegram bot token
const BOT_TOKEN = "8197379508:AAHu9UFq3cDDY1i5hwL8KCTT0NBfUhHadaw";

// Initialize the Telegram bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Store users' wallets
const userWallets = {};

// Handle "/start" command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Ask the user how they want to connect
  bot.sendMessage(chatId, "How would you like to connect your Solana wallet?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔑 Import Existing Wallet", callback_data: "import_wallet" }],
        [{ text: "🆕 Create New Wallet", callback_data: "create_wallet" }],
      ],
    },
  });
});

// Handle button clicks
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === "create_wallet") {
    const newWallet = solanaWeb3.Keypair.generate();
    const publicKey = newWallet.publicKey.toBase58();

    // Save user's wallet
    userWallets[chatId] = newWallet;

    bot.sendMessage(
      chatId,
      `✅ Wallet Created!\nYour address: \`${publicKey}\``,
      { parse_mode: "Markdown" }
    );

    // Fetch balance
    fetchSolBalance(chatId, publicKey);
  } else if (action === "import_wallet") {
    bot.sendMessage(
      chatId,
      "Send me your **private key** to import your wallet.",
      { parse_mode: "Markdown" }
    );
  }
});

// Handle private key input f

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith("/") || userWallets[chatId]) return;

  try {
    let secretKey;

    // Detect if input is Base58 or Uint8Array format
    if (text.includes(",")) {
      // Convert comma-separated string to Uint8Array
      secretKey = Uint8Array.from(text.split(",").map(Number));
    } else {
      // Convert Base58 to Uint8Array
      secretKey = bs58.decode(text);
    }

    const importedWallet = solanaWeb3.Keypair.fromSecretKey(secretKey);
    const publicKey = importedWallet.publicKey.toBase58();

    userWallets[chatId] = importedWallet;

    const balance = await fetchSolBalance(chatId, publicKey);

    bot.sendMessage(
      chatId,
      `✅ Wallet Imported!\nYour address: \`${publicKey}\`\n💰 Your SOL balance: \`${balance} SOL\``,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Import Error:", error);
    bot.sendMessage(chatId, "❌ Invalid private key! Please try again.");
  }
});

// Fetch SOL balance
async function fetchSolBalance(chatId, walletAddress) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta")
    );
    const balance = await connection.getBalance(
      new solanaWeb3.PublicKey(walletAddress)
    );

    return (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4); // Return balance with 4 decimal places
  } catch (error) {
    bot.sendMessage(chatId, "❌ Failed to fetch SOL balance.");
    return "0"; // Return zero if fetch fails
  }
}

console.log("Bot is running...");

module.exports = bot;
