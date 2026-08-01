import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyContract } from "@/lib/contract";
import { isLikelyHash } from "@/lib/hash";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("hash")?.trim() ?? "";

  if (!isLikelyHash(hash)) {
    return NextResponse.json(
      { error: "That doesn't look like a valid hash (expected 0x + 64 hex characters)." },
      { status: 400 }
    );
  }

  try {
    const registry = getReadOnlyContract();
    const [valid, issuer, recipient, title, issuedAt] = await registry.verify(hash);

    if (!valid) {
      return NextResponse.json({ valid: false, hash });
    }

    return NextResponse.json({
      valid: true,
      hash,
      issuer,
      recipient,
      title,
      issuedAt: Number(issuedAt),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Couldn't reach the chain. The RPC endpoint or contract address may be misconfigured." },
      { status: 502 }
    );
  }
}
