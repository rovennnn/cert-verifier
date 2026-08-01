const STEPS = [
  {
    title: "A document gets hashed",
    body: "The certificate's text (or file) is run through keccak256, producing a unique 32-byte fingerprint. Change one character and the hash is completely different — there's no way to reverse-engineer the original document from its hash, and no two different documents produce the same one.",
  },
  {
    title: "The hash is written on-chain",
    body: "The issuer sends a transaction that stores that hash, plus the recipient name and title, in a smart contract. Once mined, this record can't be edited or deleted by anyone — including the issuer.",
  },
  {
    title: "Anyone can verify, for free",
    body: "Verifying a certificate is a read-only call to the contract — it costs no gas and requires no wallet. Recompute the hash from a document and check it against the chain: if it matches, the document is provably the same one that was issued.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-seal">
        how it works
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        No central database to trust.
      </h1>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-ink/75">
        Traditional certificate verification means trusting whoever hosts the
        database — if their server goes down, gets hacked, or someone with
        access edits a record, verification breaks. Putting the hash on a
        public blockchain removes that single point of trust.
      </p>

      <ol className="mt-10 space-y-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-5">
            <span className="wax-seal shrink-0 font-display text-lg">
              {i + 1}
            </span>
            <div>
              <p className="font-display text-lg font-semibold">{step.title}</p>
              <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-ink/70">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="paper-card mt-12 px-5 py-5">
        <p className="font-display text-base font-semibold">
          What this doesn&apos;t do
        </p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink/70">
          It proves a document matches what was originally registered — it
          doesn&apos;t vouch for whether the issuer was trustworthy in the
          first place. Verification only tells you the record wasn&apos;t
          altered after the fact, not that the person issuing it was who
          they claimed to be. Real deployments usually pair this with some
          form of issuer identity verification off-chain.
        </p>
      </div>
    </main>
  );
}
