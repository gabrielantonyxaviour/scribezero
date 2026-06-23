import { UserPlus } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default function PatientsPage() {
  return (
    <RequireDoctor>
    <AppShell>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ds-eyebrow text-jade">Patient list</p>
          <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Patients</h1>
          <p className="mt-2 text-sm text-ink-muted">
            A lightweight clinic panel for consult history, language, and owned records.
          </p>
        </div>
        <Button
          variant="outline"
          disabled
          title="Patient creation will be enabled after the 0G KV patient index is live."
        >
          <UserPlus className="size-4" />
          New patient
        </Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <RealDataEmptyState
          icon={UserPlus}
          title="No 0G-indexed patients yet"
          body="Patient rows will appear only after patient artifacts are created, encrypted, stored on 0G, and indexed through 0G KV."
          primaryLabel="Start consult"
        />
      </div>
    </AppShell>
    </RequireDoctor>
  );
}
