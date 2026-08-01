import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Demo certificates seeded on deploy so the "verify" flow has something
// real to show immediately. Recipient names here are placeholders, not
// real people. Anyone can re-derive the same hash by hashing this exact
// text, which is how the demo "re-verify a document" flow works.
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

function hashOfDocument(text: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}

async function main() {
  const Factory = await ethers.getContractFactory("CertificateRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log(`CertificateRegistry deployed to: ${address}`);
  console.log(`Network: ${network.name}`);

  console.log("\nSeeding demo certificates...");
  const seeded: { document: string; hash: string }[] = [];
  for (const cert of DEMO_CERTIFICATES) {
    const hash = hashOfDocument(cert.document);
    const tx = await registry.issueCertificate(hash, cert.recipient, cert.title);
    await tx.wait();
    seeded.push({ document: cert.document, hash });
    console.log(`  issued: ${cert.title} -> ${hash}`);
  }

  // Write a small artifact the frontend (and this README) can reference:
  // the deployed address plus the exact demo document text/hash pairs
  // needed to try the verify flow without inventing your own certificate.
  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(
    outFile,
    JSON.stringify({ network: network.name, address, demoCertificates: seeded }, null, 2)
  );
  console.log(`\nWrote deployment info to ${outFile}`);
  console.log(
    "\nNext: copy this address into web/.env.local as NEXT_PUBLIC_CONTRACT_ADDRESS"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
