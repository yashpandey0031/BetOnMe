# VeriStake - Decentralized Credibility Layer

VeriStake is a production-quality hackathon MVP designed for the **Monad testnet**. It provides a decentralized reputation market where credibility is continuously priced by the community. Users can stake FOR (long) or AGAINST (short) profiles, turning reputation into a dynamic, market-driven signal instead of a static metric.

## 🚀 Key Features
- **Profile System**: Decentralized identities anchored to the blockchain.
- **Reputation Market**: Buy or Sell credibility. All actions require a reason (evidence).
- **AI Credibility Summary**: Evaluates profile claims to give users an immediate baseline recommendation.
- **Monad Burst Interaction**: A demonstration feature that simulates high-throughput stake transactions rapidly, showing off Monad's 10,000 TPS capabilities.

---

## 💻 Tech Stack
- **Smart Contracts**: Solidity ^0.8.20, Hardhat
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Web3 Integration**: Wagmi v2, Viem
- **Icons**: Lucide React

---

## 🛠️ Local Setup & Running the Frontend

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Contract Address**
   Once you deploy the smart contract (see below), open `frontend/src/lib/constants.ts` and set your `CONTRACT_ADDRESS`.

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`.*

---

## 📦 Smart Contract Deployment (Monad Testnet)

1. **Navigate to Contracts Directory**
   ```bash
   cd contracts
   npm install
   ```

2. **Set up your Private Key**
   You can either export your private key or use a `.env` file for Hardhat:
   ```bash
   export PRIVATE_KEY="your-wallet-private-key-here"
   ```

3. **Deploy to Monad Testnet**
   *Note: Ensure you have testnet MONAD in your wallet. (Use the official Monad faucet).*
   ```bash
   npx hardhat run scripts/deploy.js --network monadTestnet
   ```

   **Output:**
   ```
   Deploying VeriStake...
   VeriStake deployed to: 0xYourContractAddressHere
   ```
   Copy the contract address and paste it into `frontend/src/lib/constants.ts`.

---

## 🎨 Design System
- **Dark Mode Native**: Core background (`#0b0c10`), Card background (`#151821`).
- **Typography**: Clean, sans-serif *Inter* for a modern Web3 feel.
- **Accents**: 
  - Indigo/Purple for primary actions (Connect Wallet, Create Profile)
  - Neon Green (`#10b981`) for Positive Staking (Credibility)
  - Red (`#ef4444`) for Negative Staking (Unreliable)

*Built for demo velocity. Keep building!*
