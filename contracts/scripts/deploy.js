/**
 * deploy.js — deploys CertificateRegistry using ethers.js directly.
 * No Hardhat runtime is involved, so this works on Android/Termux.
 *
 * Usage:
 *   node scripts/deploy.js
 *
 * Requires .env in this directory with:
 *   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
 *   PRIVATE_KEY=0x...
 */

require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const DEMO_CERTIFICATES = [
  {
    document: "Sample Certificate — Demo Data — Web Development Bootcamp — J. Dela Cruz",
    recipient: "J. Dela Cruz",
    title: "Web Development Bootcamp — Completion",
  },
  {
    document: "Sample Certificate — Demo Data — Open Source Contribution — A. Santos",
    recipient: "A. Santos",
    title: "Open Source Contribution Recognition",
  },
  {
    document: "Sample Certificate — Demo Data — Hackathon Finalist — M. Reyes",
    recipient: "M. Reyes",
    title: "Regional Hackathon — Finalist",
  },
];

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    console.error("Missing SEPOLIA_RPC_URL or PRIVATE_KEY in .env");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying from:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("Wallet has no Sepolia ETH. Get some from the faucet first.");
    process.exit(1);
  }

  // Load pre-compiled artifact — no Hardhat/solc needed on this machine.
  const artifact = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "..", "CertificateRegistry.artifact.json"),
      "utf8"
    )
  );

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("\nDeploying CertificateRegistry...");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("CertificateRegistry deployed to:", address);

  console.log("\nSeeding demo certificates...");
  const seeded = [];
  for (const cert of DEMO_CERTIFICATES) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(cert.document));
    const tx = await contract.issueCertificate(hash, cert.recipient, cert.title);
    await tx.wait();
    seeded.push({ document: cert.document, hash });
    console.log(" issued:", cert.title);
    console.log("   hash:", hash);
  }

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "sepolia.json");
  fs.writeFileSync(
    outFile,
    JSON.stringify({ network: "sepolia", address, demoCertificates: seeded }, null, 2)
  );

  console.log("\nDeployment saved to:", outFile);
  console.log("\nNext steps:");
  console.log("  CONTRACT_ADDRESS =", address);
  console.log("  Copy this into Vercel's environment variables.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
