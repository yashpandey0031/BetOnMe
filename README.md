# VeriStake

VeriStake is a decentralized credibility layer where reputation is continuously priced by community stake on Monad testnet.

The product narrative is trust and accountability, not betting:

- Stake FOR a profile when you believe claims are credible.
- Stake AGAINST when you believe claims are unreliable.
- Reputation score updates after every action.

## MVP Scope

- On-chain profile creation: name + description.
- Live reputation market: FOR and AGAINST staking.
- Evidence requirement: stake at or above threshold requires reason.
- Real-time refresh: contract events update profile views.
- Monad burst demo: one button triggers multiple rapid stake actions.
- Optional AI summary: credibility summary while creating a profile.

## Project Structure

- contracts: Solidity contract + Hardhat deploy setup.
- frontend: Next.js App Router UI + wagmi/viem integration.

## Smart Contract

Main contract: contracts/contracts/VeriStake.sol

Implemented methods:

- createProfile(name, description)
- stake(profileId, isFor, evidence) payable
- burstStake(profileId, forCount, againstCount, evidence) payable
- getProfile(profileId)

Core on-chain state:

- forStake
- againstStake
- reputationScore
- total stake derived as forStake + againstStake

Reputation formula:

- score = (forStake \* 10000) / (forStake + againstStake)
- neutral baseline is 5000 when no stake exists

Events:

- ProfileCreated
- Staked

## Monad Testnet Deployment

1. Install dependencies

```bash
cd contracts
npm install
```

1. Create env file

```bash
cp .env.example .env
```

Set values in .env:

- PRIVATE_KEY=your_private_key_without_0x
- `MONAD_RPC_URL=https://testnet-rpc.monad.xyz`

1. Compile and deploy

```bash
npm run compile
npm run deploy:monad
```

Expected output:

- VeriStake deployed to: 0x...

## Frontend Setup

1. Install dependencies

```bash
cd frontend
npm install
```

1. Configure frontend env

```bash
cp .env.example .env.local
```

Update values:

- NEXT_PUBLIC_VERISTAKE_ADDRESS=deployed_contract_address
- `NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz`
- GEMINI_API_KEY=optional_for_ai_summary

1. Run app

```bash
npm run dev
```

Open <http://localhost:3000>

## MetaMask Requirements

- Connect wallet from the top bar.
- Switch to Monad Testnet in MetaMask (the UI prompts switch if needed).
- Fund wallet with Monad testnet tokens before staking.

## 3-Minute Live Demo Flow

1. Connect MetaMask.
2. Create a profile and generate AI credibility summary.
3. Open that profile.
4. Stake FOR with evidence.
5. Stake AGAINST with evidence.
6. Press Monad Burst Interaction and show rapid score updates.

## Notes for Judges

- VeriStake turns credibility into a transparent, dynamic market signal.
- Evidence-backed staking creates accountability.
- Monad throughput is demonstrated through burst interactions and fast UI refresh.
