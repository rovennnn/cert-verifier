import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-ink/15">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="wax-seal font-display text-lg">CR</span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Certificate Registry
          </span>
        </Link>
        <nav className="flex gap-5 font-mono text-xs uppercase tracking-wide text-ink/70">
          <Link href="/" className="hover:text-seal">
            verify
          </Link>
          <Link href="/issue" className="hover:text-seal">
            issue
          </Link>
          <Link href="/how-it-works" className="hover:text-seal">
            how it works
          </Link>
        </nav>
      </div>
    </header>
  );
}
