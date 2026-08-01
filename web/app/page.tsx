import { VerifyForm } from "@/components/verify-form";
import { DEMO_CERTIFICATES } from "@/lib/demo-certificates";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-seal">
        verify a certificate
      </p>
      <h1 className="mt-3 max-w-prose font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
        Check if a document is genuine, straight from the chain.
      </h1>
      <p className="mt-4 max-w-prose text-base leading-relaxed text-ink/75">
        Every certificate issued through this registry has its hash written
        to a smart contract. Paste the certificate text, upload the file, or
        enter a hash directly — there&apos;s nothing to trust but the chain
        itself.
      </p>

      <div className="mt-8">
        <VerifyForm />
      </div>

      <div className="mt-14 border-t border-ink/15 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          try a demo certificate
        </p>
        <p className="mt-2 max-w-prose text-sm text-ink/70">
          These three were seeded on deploy. Switch to &quot;paste text&quot;
          above and paste one exactly as written to see a real verified
          result.
        </p>
        <ul className="mt-4 space-y-3">
          {DEMO_CERTIFICATES.map((cert) => (
            <li key={cert.title} className="paper-card px-4 py-3">
              <p className="font-display text-sm font-semibold">{cert.title}</p>
              <p className="mt-1 break-all font-mono text-xs text-ink/60">
                {cert.document}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
