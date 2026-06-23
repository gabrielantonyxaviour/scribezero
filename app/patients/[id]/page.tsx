import Link from "next/link";
import { Database } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <RequireDoctor>
      <AppShell>
        <div className="mx-auto max-w-3xl">
          <header className="mb-6 rounded-xl border border-border bg-surface-1 p-5">
            <p className="ds-eyebrow text-jade">Patient lookup</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="ds-display text-[38px] leading-none text-ink">{id}</h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Patient detail pages now require a real encrypted 0G patient artifact and KV index entry.
                </p>
              </div>
              <Button asChild variant="live">
                <Link href="/app">Start consult</Link>
              </Button>
            </div>
          </header>

          <RealDataEmptyState
            icon={Database}
            title="Patient not indexed"
            body="Patient charts load only from encrypted 0G Storage artifacts discovered through 0G KV."
            detail="A patient chart needs an encrypted Storage artifact plus a 0G KV index entry from a reachable KV node."
          />
        </div>
      </AppShell>
    </RequireDoctor>
  );
}
