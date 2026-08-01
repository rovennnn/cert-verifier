import { ethers } from "ethers";

// Minimal ABI — only the functions this app actually calls.
export const CERTIFICATE_REGISTRY_ABI = [
  "function issueCertificate(bytes32 hash, string recipient, string title) external",
  "function verify(bytes32 hash) external view returns (bool valid, address issuer, string recipient, string title, uint256 issuedAt)",
  "function totalCertificates() external view returns (uint256)",
  "function recentHashes(uint256 limit) external view returns (bytes32[])",
  "event CertificateIssued(bytes32 indexed hash, address indexed issuer, string recipient, string title, uint256 issuedAt)",
] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy web/.env.local.example to web/.env.local and fill it in.`
    );
  }
  return value;
}

export function getProvider() {
  const rpcUrl = requireEnv("RPC_URL");
  return new ethers.JsonRpcProvider(rpcUrl);
}

/** Read-only contract instance — safe to use for any visitor's request. */
export function getReadOnlyContract() {
  const address = requireEnv("CONTRACT_ADDRESS");
  return new ethers.Contract(address, CERTIFICATE_REGISTRY_ABI, getProvider());
}

/**
 * Signer-backed contract instance — can send transactions. Only ever used
 * server-side, behind the passphrase check in app/api/issue/route.ts. The
 * contract's own `onlyOwner` check is the real enforcement; the passphrase
 * just keeps the demo's issue endpoint from being spammed.
 */
export function getIssuerContract() {
  const address = requireEnv("CONTRACT_ADDRESS");
  const privateKey = requireEnv("PRIVATE_KEY");
  const wallet = new ethers.Wallet(privateKey, getProvider());
  return new ethers.Contract(address, CERTIFICATE_REGISTRY_ABI, wallet);
}
