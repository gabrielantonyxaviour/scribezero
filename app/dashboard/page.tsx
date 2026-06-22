import Link from "next/link";
import { CalendarClock, CheckCircle2, ClipboardList, FileText, Mic, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import {
  APPOINTMENTS,
  DOCTOR_PROFILE,
  ONBOARDING_STEPS,
  TASKS,
  patientName,
} from "@/lib/mock/product";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface-1">
      <div className="border-b border-border px-4 py-3">
        <p className="ds-eyebrow text-ink-dim">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const openTasks = TASKS.filter((task) => task.status !== "done");
  const completedSetup = ONBOARDING_STEPS.filter((step) => step.status === "done").length;

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <header className="rounded-xl border border-border bg-surface-1 p-5">
            <p className="ds-eyebrow text-jade">Doctor workspace</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="ds-display text-[36px] leading-none text-ink">
                  Good morning, {DOCTOR_PROFILE.name}.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                  Your consult queue, patient follow-ups, and verified records are ready.
                </p>
              </div>
              <Button asChild variant="live" size="lg">
                <Link href="/app">
                  <Mic className="size-4" />
                  Start consult
                </Link>
              </Button>
            </div>
          </header>

          <Panel title="Today">
            <div className="divide-y divide-border">
              {APPOINTMENTS.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/patients/${appointment.patientId}`}
                  className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[64px_1fr_150px]"
                >
                  <span className="ds-mono text-sm text-jade">{appointment.time}</span>
                  <span>
                    <span className="block text-sm font-medium text-ink">
                      {patientName(appointment.patientId)}
                    </span>
                    <span className="mt-1 block text-xs text-ink-muted">{appointment.kind}</span>
                  </span>
                  <span className="text-xs text-ink-muted sm:text-right">{appointment.status}</span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Clinical tasks">
            <div className="grid gap-3 md:grid-cols-2">
              {openTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/patients/${task.patientId}`}
                  className="rounded-md border border-border bg-surface-3 p-3 transition-colors hover:border-border-strong"
                >
                  <p className="text-sm font-medium text-ink">{task.title}</p>
                  <p className="mt-2 ds-mono text-[11px] text-ink-dim">
                    {patientName(task.patientId)} · {task.due}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Setup">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md border border-jade-deep bg-jade-soft">
                <CheckCircle2 className="size-5 text-jade" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {completedSetup}/{ONBOARDING_STEPS.length} complete
                </p>
                <p className="text-xs text-ink-muted">Finish setup before the demo.</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/onboarding">Continue onboarding</Link>
            </Button>
          </Panel>

          <Panel title="Clinic">
            <div className="space-y-3 text-sm">
              <Info icon={<ShieldCheck className="size-4" />} label={DOCTOR_PROFILE.clinic} />
              <Info icon={<CalendarClock className="size-4" />} label={DOCTOR_PROFILE.location} />
              <Info icon={<ClipboardList className="size-4" />} label={DOCTOR_PROFILE.languageLine} />
            </div>
          </Panel>

          <Panel title="Workspace">
            <div className="space-y-2">
              <QuickLink href="/consultations" icon={<Mic className="size-4" />} label="Consultations" />
              <QuickLink href="/tasks" icon={<ClipboardList className="size-4" />} label="Tasks" />
              <QuickLink href="/documents" icon={<FileText className="size-4" />} label="Documents" />
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-muted">
      <span className="text-jade">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md border border-border bg-surface-3 px-3 py-2 text-sm text-ink-muted transition-colors hover:border-border-strong hover:text-ink"
    >
      <span className="text-jade">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
