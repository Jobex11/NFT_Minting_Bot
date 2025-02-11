/*


const TelegramBot = require("node-telegram-bot-api");
const solanaWeb3 = require("@solana/web3.js");
const bs58 = require("bs58");

const BOT_TOKEN = "";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const userWallets = {};

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "How would you like to connect your Solana wallet?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔑 Import Existing Wallet", callback_data: "import_wallet" }],
        [{ text: "🆕 Create New Wallet", callback_data: "create_wallet" }],
      ],
    },
  });
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const action = callbackQuery.data;

  if (action === "create_wallet") {
    const newWallet = solanaWeb3.Keypair.generate();
    const publicKey = newWallet.publicKey.toBase58();

    userWallets[chatId] = newWallet;

    bot.sendMessage(
      chatId,
      `✅ Wallet Created!\nYour address: \`${publicKey}\``,
      { parse_mode: "Markdown" }
    );

    fetchSolBalance(chatId, publicKey);
  } else if (action === "import_wallet") {
    bot.sendMessage(
      chatId,
      "Send me your **private key** to import your wallet.",
      { parse_mode: "Markdown" }
    );
  }
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text.startsWith("/") || userWallets[chatId]) return;

  try {
    let secretKey;

    if (text.includes(",")) {
      secretKey = Uint8Array.from(text.split(",").map(Number));
    } else {
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

async function fetchSolBalance(chatId, walletAddress) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta")
    );
    const balance = await connection.getBalance(
      new solanaWeb3.PublicKey(walletAddress)
    );

    return (balance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);
  } catch (error) {
    bot.sendMessage(chatId, "❌ Failed to fetch SOL balance.");
    return "0";
  }
}

console.log("Bot is running...");



*/
