import Link from "next/link";
import { Mic } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default function ConsultationsPage() {
  return (
    <RequireDoctor>
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

      <RealDataEmptyState
        icon={Mic}
        title="No 0G-indexed consultations yet"
        body="Consultations will show here only after real microphone capture, 0G Router STT, verified 0G Compute, encrypted 0G Storage, and 0G KV indexing."
        primaryLabel="New consult"
      />
    </AppShell>
    </RequireDoctor>
  );
}
