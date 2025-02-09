const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
  console.log(msg);
  bot.sendMessage(msg.chat.id, `Your Chat ID: ${msg.chat.id}`);
});
