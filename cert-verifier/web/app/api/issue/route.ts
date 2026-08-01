import { NextRequest, NextResponse } from "next/server";
import { getIssuerContract } from "@/lib/contract";
import { hashText } from "@/lib/hash";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { document, recipient, title, passphrase } = body as {
    document?: string;
    recipient?: string;
    title?: string;
    passphrase?: string;
  };

  const expectedPassphrase = process.env.ADMIN_PASSPHRASE;
  if (!expectedPassphrase || passphrase !== expectedPassphrase) {
    return NextResponse.json({ error: "Incorrect issuer passphrase." }, { status: 401 });
  }

  if (!document?.trim() || !recipient?.trim() || !title?.trim()) {
    return NextResponse.json(
      { error: "Document text, recipient, and title are all required." },
      { status: 400 }
    );
  }

  const hash = hashText(document.trim());

  try {
    const registry = getIssuerContract();
    const tx = await registry.issueCertificate(hash, recipient.trim(), title.trim());
    const receipt = await tx.wait();

    return NextResponse.json({
      hash,
      txHash: receipt?.hash ?? tx.hash,
    });
  } catch (error: unknown) {
    console.error(error);
    const message =
      error instanceof Error && error.message.includes("AlreadyIssued")
        ? "This exact document has already been issued a certificate."
        : "Couldn't send the transaction. The RPC endpoint, private key, or contract address may be misconfigured.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
