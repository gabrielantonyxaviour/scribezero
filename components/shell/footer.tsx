import Link from "next/link";
import { LiveDot } from "@/components/sz/live-dot";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-3">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row lg:px-6">
        <span className="ds-display text-[17px] text-ink">ScribeZero</span>
        <span className="ds-mono text-[11px] text-ink-dim">
          Inference via 0G Compute TeeTLS · Records on 0G Storage
        </span>
        <div className="flex items-center gap-4">
          <Link href="/verify" className="text-xs text-ink-muted hover:text-ink">
            Verify
          </Link>
          <a
            href="https://github.com"
            className="text-xs text-ink-muted hover:text-ink"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-2.5 py-1">
            <LiveDot size={6} />
            <span className="ds-mono text-[11px] text-jade">0G testnet · live</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
