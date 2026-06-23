import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Database, Mic, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RealDataEmptyState({
  icon: Icon = Database,
  title,
  body,
  detail = "0G KV indexing needs a reachable ZEROG_KV_RPC and monitored ZEROG_KV_STREAM_ID before this workspace can list records across sessions.",
  primaryHref = "/app",
  primaryLabel = "Start real consult",
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  detail?: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface-3 px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-border bg-surface-1 text-jade">
        <Icon className="size-5" />
      </span>
      <h2 className="ds-display text-[27px] leading-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-[460px] text-sm leading-relaxed text-ink-muted">{body}</p>
      <div className="mx-auto mt-4 flex max-w-[520px] items-start gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2 text-left text-xs leading-relaxed text-ink-dim">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-jade" />
        <span>{detail}</span>
      </div>
      <Button asChild variant="live" className="mt-5">
        <Link href={primaryHref}>
          <Mic className="size-4" />
          {primaryLabel}
        </Link>
      </Button>
    </div>
  );
}
