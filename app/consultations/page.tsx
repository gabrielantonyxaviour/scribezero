import Link from "next/link";
import { Mic, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { DEMO_RECORDS } from "@/lib/mock/data";

export default function ConsultationsPage() {
  return (
    <AppShell className="max-w-[900px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ds-eyebrow text-jade">Consultations</p>
          <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">
            Visit history
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Every visit can become a structured note, a patient summary, and an owned record.
          </p>
        </div>
        <Button asChild variant="live">
          <Link href="/app">
            <Mic className="size-4" />
            New consult
          </Link>
        </Button>
      </header>

      <div className="space-y-3">
        {DEMO_RECORDS.map((record) => (
          <Link
            key={record.id}
            href={`/records/${record.id}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-jade-deep bg-jade-soft text-jade">
              <ShieldCheck className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{record.complaint}</span>
              <span className="mt-1 block ds-mono text-[11px] text-ink-dim">
                {record.code} · {record.status}
              </span>
            </span>
            <span className="text-xs text-ink-muted">{record.language.toUpperCase()}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
