import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { TASKS, patientName } from "@/lib/mock/product";

export default function TasksPage() {
  return (
    <AppShell className="max-w-[860px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Follow-up queue</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Tasks</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The work that makes the scribe useful after the visit.
        </p>
      </header>

      <div className="space-y-3">
        {TASKS.map((task) => (
          <Link
            key={task.id}
            href={`/patients/${task.patientId}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3 text-jade">
              {task.status === "done" ? <CheckCircle2 className="size-5" /> : <Clock3 className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-ink">{task.title}</span>
              <span className="mt-1 block text-xs text-ink-muted">{patientName(task.patientId)}</span>
            </span>
            <span className="ds-mono text-[11px] uppercase text-ink-dim">{task.due}</span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
