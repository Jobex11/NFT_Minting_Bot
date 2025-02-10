require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const {
  Connection,
  Keypair,
  PublicKey,
  clusterApiUrl,
} = require("@solana/web3.js");
const bs58 = require("bs58"); // Import bs58
const {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
  toMetaplexFile,
} = require("@metaplex-foundation/js");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const upload = multer({ dest: "uploads/" });
const app = express();
const port = 3000;

let userSessions = {};

const connection = new Connection(clusterApiUrl("devnet")); // Change to 'mainnet-beta' for mainnet

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🚀 Welcome to the Solana NFT Minter!\n\nSend an image (or URL), name, description, and your wallet private key to mint an NFT."
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userSessions[chatId]) {
    userSessions[chatId] = {};
  }

  if (msg.photo) {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const fileLink = await bot.getFileLink(fileId);
    userSessions[chatId].imageUrl = fileLink;
    bot.sendMessage(chatId, "✅ Image received! Now send the NFT name.");
  } else if (text && text.startsWith("http")) {
    userSessions[chatId].imageUrl = text;
    bot.sendMessage(chatId, "✅ Image URL received! Now send the NFT name.");
  } else if (!userSessions[chatId].name) {
    userSessions[chatId].name = text;
    bot.sendMessage(chatId, "✅ Name saved! Now send a description.");
  } else if (!userSessions[chatId].description) {
    userSessions[chatId].description = text;
    bot.sendMessage(
      chatId,
      "✅ Description saved! Now send the NFT price (in SOL)."
    );
  } else if (!userSessions[chatId].price) {
    userSessions[chatId].price = text;
    bot.sendMessage(
      chatId,
      "✅ Price saved! Now send your private key to sign the transaction."
    );
  } else if (!userSessions[chatId].privateKey) {
    try {
      bot.sendMessage(chatId, `🔍 Received private key: ${text}`);

      // Decode Base58 private key
      const decodedKey = bs58.decode(text.trim());
      userSessions[chatId].privateKey = decodedKey;

      bot.sendMessage(chatId, "✅ Private key saved! Minting NFT...");
      mintNFT(chatId);
    } catch (error) {
      console.error("Private Key Error:", error);
      bot.sendMessage(chatId, "❌ Invalid private key! Try again.");
    }
  }
});

async function mintNFT(chatId) {
  try {
    const user = userSessions[chatId];
    if (!user || !user.privateKey) {
      return bot.sendMessage(chatId, "❌ Missing private key!");
    }

    const wallet = Keypair.fromSecretKey(user.privateKey);
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(wallet))
      .use(bundlrStorage());

    const metadataUri = await metaplex.nfts().uploadMetadata({
      name: user.name,
      description: user.description,
      image: user.imageUrl,
      properties: { files: [{ uri: user.imageUrl, type: "image/png" }] },
    });

    const { nft } = await metaplex.nfts().create({
      uri: metadataUri.uri,
      name: user.name,
      sellerFeeBasisPoints: 500,
      symbol: "NFT",
      maxSupply: 1,
    });

    bot.sendMessage(
      chatId,
      `✅ NFT Minted Successfully!\n🔗 NFT Address: ${nft.address}`
    );
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Failed to mint NFT. Check console logs.");
  } finally {
    delete userSessions[chatId];
  }
}

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const metaplexFile = toMetaplexFile(fileBuffer, req.file.originalname);
    fs.unlinkSync(filePath);
    res.send({ message: "File uploaded successfully!" });
  } catch (error) {
    res.status(500).send({ error: "File upload failed" });
  }
});

module.exports = bot;
