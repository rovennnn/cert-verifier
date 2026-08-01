import { ethers } from "ethers";

/** Hashes UTF-8 text exactly the way the contract's seed script does. */
export function hashText(text: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}

/** Hashes raw file bytes — for verifying an uploaded document. */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return ethers.keccak256(new Uint8Array(buffer));
}

/** Loosely validates a 0x-prefixed 32-byte hex hash. */
export function isLikelyHash(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value.trim());
}
