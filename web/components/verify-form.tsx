"use client";

import { useState } from "react";
import { hashFile, hashText, isLikelyHash } from "@/lib/hash";

type Mode = "text" | "file" | "hash";

type VerifyResult =
  | { valid: true; hash: string; issuer: string; recipient: string; title: string; issuedAt: number }
  | { valid: false; hash: string }
  | null;

export function VerifyForm() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [hashInput, setHashInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult>(null);

  async function runVerify(hash: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/verify?hash=${hash}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error — couldn't reach the verification service.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "text") {
      if (!text.trim()) return;
      const hash = hashText(text.trim());
      setComputedHash(hash);
      await runVerify(hash);
    } else if (mode === "hash") {
      const trimmed = hashInput.trim();
      if (!isLikelyHash(trimmed)) {
        setError("That doesn't look like a valid 0x + 64 hex character hash.");
        return;
      }
      setComputedHash(trimmed);
      await runVerify(trimmed);
    }
    // "file" mode submits from the file input's onChange instead.
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const hash = await hashFile(file);
    setComputedHash(hash);
    await runVerify(hash);
  }

  return (
    <div>
      <div className="flex gap-2 font-mono text-xs uppercase tracking-wide">
        {(["text", "file", "hash"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setResult(null);
              setError(null);
              setComputedHash(null);
            }}
            className={`border px-3 py-1.5 transition-colors ${
              mode === m
                ? "border-seal bg-seal text-paper"
                : "border-ink/25 text-ink/70 hover:border-ink/50"
            }`}
          >
            {m === "text" ? "paste text" : m === "file" ? "upload file" : "paste hash"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        {mode === "text" && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the exact certificate text you want to verify…"
              rows={5}
              className="w-full border border-ink/25 bg-paper px-4 py-3 font-mono text-sm text-ink placeholder:text-ink/40 focus:border-seal focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="mt-3 border border-seal bg-seal px-5 py-2 font-mono text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "checking…" : "verify"}
            </button>
          </>
        )}

        {mode === "file" && (
          <label className="flex cursor-pointer flex-col items-start gap-2 border border-dashed border-ink/30 px-4 py-6 hover:border-seal">
            <span className="font-mono text-sm text-ink/70">
              {fileName ?? "Choose a file to hash and verify"}
            </span>
            <input type="file" onChange={handleFile} className="hidden" />
            <span className="tag">browse</span>
          </label>
        )}

        {mode === "hash" && (
          <>
            <input
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="0x…"
              className="w-full border border-ink/25 bg-paper px-4 py-3 font-mono text-sm text-ink placeholder:text-ink/40 focus:border-seal focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !hashInput.trim()}
              className="mt-3 border border-seal bg-seal px-5 py-2 font-mono text-sm text-paper transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "checking…" : "verify"}
            </button>
          </>
        )}
      </form>

      {computedHash && (
        <p className="mt-3 break-all font-mono text-xs text-ink/50">
          hash: {computedHash}
        </p>
      )}

      {error && (
        <p className="mt-4 border border-seal/40 bg-seal/5 px-4 py-3 font-mono text-sm text-seal-dark">
          {error}
        </p>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
}

function ResultCard({ result }: { result: NonNullable<VerifyResult> }) {
  if (!result.valid) {
    return (
      <div className="paper-card mt-5 flex items-start gap-4 px-5 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/30 font-mono text-xs text-ink/50">
          ✕
        </span>
        <div>
          <p className="font-display text-lg font-semibold">Not found</p>
          <p className="mt-1 max-w-prose text-sm text-ink/70">
            No certificate matches this hash. Either it was never issued, or
            the document has been altered since it was — even a single
            changed character produces a completely different hash.
          </p>
        </div>
      </div>
    );
  }

  const date = new Date(result.issuedAt * 1000);

  return (
    <div className="paper-card mt-5 flex items-start gap-4 px-5 py-5">
      <span className="wax-seal shrink-0 font-mono text-xs">OK</span>
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold">Verified</p>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex flex-wrap gap-2">
            <dt className="text-ink/50">recipient</dt>
            <dd>{result.recipient}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-ink/50">title</dt>
            <dd>{result.title}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <dt className="text-ink/50">issued</dt>
            <dd>{date.toISOString().slice(0, 10)}</dd>
          </div>
          <div className="flex flex-wrap gap-2 break-all">
            <dt className="shrink-0 text-ink/50">issuer</dt>
            <dd className="font-mono text-xs">{result.issuer}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
