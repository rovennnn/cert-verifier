# On-Chain Certificate Verifier

Register a document's hash on a smart contract; anyone can then verify that
document is authentic and untampered — no central database required.

Two packages:
- **`contracts/`** — the Solidity smart contract, tests, and deploy script
  (Hardhat)
- **`web/`** — the Next.js app: a verify page, an issue page, and the API
  routes that talk to the contract

## Quick start (local, no testnet needed)

You need three terminals (or three Termux sessions on a phone).

**1. Install and start a local chain:**
```bash
cd contracts
npm install
npx hardhat node
```
Leave this running — it prints 20 test accounts with private keys.

**2. Deploy the contract and seed demo certificates** (new terminal):
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```
This prints the deployed contract address and writes it to
`contracts/deployments/localhost.json`.

**3. Configure and run the frontend** (new terminal):
```bash
cd web
npm install
cp .env.local.example .env.local
```
Edit `.env.local`:
```
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=<address from step 2>
PRIVATE_KEY=<any private key printed by `hardhat node` in step 1>
ADMIN_PASSPHRASE=pick-anything
```
Then:
```bash
npm run dev
```
Visit `http://localhost:3000`. The home page has three demo certificates you
can paste into "verify" to see a real result — they're the ones seeded by
the deploy script.

## Deploying for real (Sepolia testnet + Vercel)

**1. Get free testnet resources:**
- An RPC URL: sign up free at [Alchemy](https://www.alchemy.com/) or
  [Infura](https://www.infura.io/), create a Sepolia app, copy the URL.
- Testnet ETH: create/use a wallet (e.g. MetaMask), grab its private key,
  and get free Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com/).

**2. Deploy the contract:**
```bash
cd contracts
cp .env.example .env
# fill in SEPOLIA_RPC_URL and PRIVATE_KEY in .env
npx hardhat run scripts/deploy.ts --network sepolia
```
Copy the printed contract address.

**3. Push both packages to GitHub, then deploy the `web/` folder to Vercel:**
- In Vercel, when importing the repo, set the **Root Directory** to `web`
  (since this is a two-package repo, not a single Next.js app at the root).
- Add these environment variables in the Vercel project settings:
  `RPC_URL` (same Sepolia RPC URL), `CONTRACT_ADDRESS` (from step 2),
  `PRIVATE_KEY` (the same wallet — only needed if you want the live site's
  "Issue" page to work; omit it if you only want "Verify" to work publicly),
  `ADMIN_PASSPHRASE`.
- Deploy.

**Security note:** the `PRIVATE_KEY` you put in Vercel controls a real
(if lightly funded, testnet-only) wallet. Never use a private key that
holds real mainnet funds for this project.

## Running the tests

```bash
cd contracts
npx hardhat test
```

## Project structure

```
contracts/
  contracts/CertificateRegistry.sol   — the smart contract
  test/CertificateRegistry.test.ts     — Hardhat/Chai tests
  scripts/deploy.ts                    — deploy + seed demo certificates
  hardhat.config.ts

web/
  app/page.tsx                — verify page (home)
  app/issue/page.tsx          — issue page (passphrase-gated)
  app/how-it-works/page.tsx
  app/api/verify/route.ts     — read-only contract call, no wallet needed
  app/api/issue/route.ts      — signs + sends a transaction server-side
  lib/contract.ts             — ABI + provider/contract helpers
  lib/hash.ts                 — client-side keccak256 hashing
```
