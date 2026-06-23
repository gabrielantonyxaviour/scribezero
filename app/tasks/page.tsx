import { Clock3 } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default function TasksPage() {
  return (
    <RequireDoctor>
    <AppShell className="max-w-[860px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Follow-up queue</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Tasks</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The work that makes the scribe useful after the visit.
        </p>
      </header>

      <RealDataEmptyState
        icon={Clock3}
        title="No real follow-up tasks yet"
        body="Task rows will be created from sealed patient records and generated documents after the 0G patient/document index is live."
        primaryLabel="Start consult"
      />
    </AppShell>
    </RequireDoctor>
  );
}
