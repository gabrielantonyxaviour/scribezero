import Link from "next/link";
import { Database, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shell/brand-logo";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default async function ShareCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 sm:py-16">
      <article className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-bg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <BrandLogo href="/" size="lg" />
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5">
            <ShieldCheck className="size-3.5 text-jade" />
            <span className="ds-mono text-[11px] text-jade">root required</span>
          </span>
        </div>

        <div className="p-6 sm:p-7">
          <p className="ds-eyebrow text-ink-dim">Share code · {code.toUpperCase()}</p>
          <h1 className="ds-display mt-2 text-[38px] leading-tight text-ink">
            Public share cards now require a real 0G index.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Demo share cards have been removed. Until 0G KV indexing is configured, share a real Storage root through the verifier.
          </p>

          <div className="mt-6">
            <RealDataEmptyState
              icon={Database}
              title="Share record not indexed"
              body="This share code is not backed by a 0G KV entry yet."
              detail="Use /verify?root=... with a real 0G Storage root to prove encrypted artifacts without exposing clinical contents."
              primaryHref="/verify"
              primaryLabel="Verify by root"
            />
          </div>

          <Button asChild variant="outline" size="lg" className="mt-4 h-11 w-full">
            <Link href="/app">Create a real encrypted record</Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
