# Custom RPC NFT Minting Bot 🚀

## Introduction

The **Custom RPC NFT Minting Bot** is a **Node.js & Express.js** backend application designed to mint NFTs on the **Solana blockchain**. It allows users to select RPC nodes, manage wallets, track fees, and execute minting operations **via Telegram**.

---

## Features 🔥

### ✅ User Features

- **RPC Selection**: Users can choose a custom Solana RPC for transactions.
- **NFT Minting**: Users specify the number of NFTs to mint.
- **Stage Selection**: Users select the minting stage (presale, public sale, etc.).
- **Wallet Management**: Users can add and select wallets for minting.
- **Transaction Monitoring**: The bot provides real-time transaction fees and compute unit details.
- **Telegram Integration**: Users interact with the bot via Telegram for executing minting operations.

### 🔧 Admin Features

- **Manage RPC Nodes**: Admins can add, update, and remove RPC nodes.
- **Wallet Management**: Admins can oversee and manage user wallets.
- **Transaction Logging**: All transactions are recorded for auditing and debugging.

### ⚡ Automation Features

- **RPC Health Check**: The bot automatically tests RPC availability and responsiveness.
- **Gas & Compute Unit Estimation**: Estimates transaction fees before minting to optimize costs.

---

## 🏗️ Technology Stack

| Component   | Technology          |
| ----------- | ------------------- |
| Backend     | Node.js, Express.js |
| Database    | MongoDB             |
| Blockchain  | Solana Web3.js      |
| Messaging   | Telegram Bot API    |
| API Calls   | Axios               |
| Environment | dotenv              |

---

## 🛠️ Installation Guide

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/yourusername/rpc-nft-minting-bot.git
cd rpc-nft-minting-bot
```
