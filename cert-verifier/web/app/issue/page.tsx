"use client";

import { useState } from "react";

export default function IssuePage() {
  const [document, setDocument] = useState("");
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ hash: string; txHash: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, recipient, title, passphrase }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(data);
      setDocument("");
      setRecipient("");
      setTitle("");
    } catch {
      setError("Network error — couldn't reach the issuing service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-seal">
        issue a certificate
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Register a new certificate on-chain.
      </h1>
      <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink/70">
        This writes a real transaction to the contract, signed by the
        registry&apos;s owner account. It&apos;s passphrase-gated here as a
        demo convenience — the contract itself also enforces that only the
        owner address can issue, regardless of the passphrase.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="document text">
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            rows={4}
            required
            placeholder="The exact text that will be hashed and verified later"
            className="w-full border border-ink/25 bg-paper px-4 py-3 font-mono text-sm placeholder:text-ink/40 focus:border-seal focus:outline-none"
          />
        </Field>
        <Field label="recipient">
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="w-full border border-ink/25 bg-paper px-4 py-3 text-sm focus:border-seal focus:outline-none"
          />
        </Field>
        <Field label="title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border border-ink/25 bg-paper px-4 py-3 text-sm focus:border-seal focus:outline-none"
          />
        </Field>
        <Field label="issuer passphrase">
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            required
            className="w-full border border-ink/25 bg-paper px-4 py-3 font-mono text-sm focus:border-seal focus:outline-none"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="border border-seal bg-seal px-5 py-2 font-mono text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "sending transaction…" : "issue certificate"}
        </button>
      </form>

      {error && (
        <p className="mt-6 border border-seal/40 bg-seal/5 px-4 py-3 font-mono text-sm text-seal-dark">
          {error}
        </p>
      )}

      {success && (
        <div className="paper-card mt-6 space-y-2 px-5 py-5">
          <p className="font-display text-lg font-semibold">Issued on-chain</p>
          <p className="break-all font-mono text-xs text-ink/60">
            hash: {success.hash}
          </p>
          <p className="break-all font-mono text-xs text-ink/60">
            tx: {success.txHash}
          </p>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-wide text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}
