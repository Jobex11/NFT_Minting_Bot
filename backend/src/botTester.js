require("dotenv").config();
const {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} = require("@solana/web3.js");
const {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} = require("@metaplex-foundation/js");
const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Load wallet from private key
const secretKey = Uint8Array.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY));
const payer = Keypair.fromSecretKey(secretKey);
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(payer))
  .use(bundlrStorage());

// Start Bot
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Use /mint to mint an NFT.");
});

// Mint NFT Command
bot.onText(/\/mint/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Minting your NFT... ⏳");

  try {
    // Upload metadata to Arweave
    const metadata = await metaplex.nfts().uploadMetadata({
      name: "Solana NFT",
      symbol: "SOLNFT",
      description: "Minted via Telegram bot",
      image: "https://arweave.net/random_image_url.jpg",
    });

    console.log("Metadata uploaded:", metadata.uri);

    // Mint NFT
    const { nft } = await metaplex.nfts().create({
      uri: metadata.uri,
      name: "Solana NFT",
      symbol: "SOLNFT",
      sellerFeeBasisPoints: 500, // 5% royalties
    });

    console.log("NFT Minted:", nft.address.toBase58());

    bot.sendMessage(
      chatId,
      `✅ NFT Minted Successfully!\n\nMint Address: ${nft.address.toBase58()}`
    );
  } catch (error) {
    console.error("Minting failed:", error);
    bot.sendMessage(chatId, "❌ NFT Minting Failed.");
  }
});

console.log("🤖 Telegram bot is running...");
