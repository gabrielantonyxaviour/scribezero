import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, MessageSquare, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { DOCUMENTS, TASKS, getPatient } from "@/lib/mock/product";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = getPatient(id);
  if (!patient) notFound();

  const documents = DOCUMENTS.filter((doc) => doc.patientId === patient.id);
  const tasks = TASKS.filter((task) => task.patientId === patient.id);

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="space-y-5">
          <header className="rounded-xl border border-border bg-surface-1 p-5">
            <p className="ds-eyebrow text-jade">Patient</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="ds-display text-[38px] leading-none text-ink">{patient.name}</h1>
                <p className="mt-2 text-sm text-ink-muted">
                  {patient.age}{patient.sex} · {patient.language} · {patient.phone}
                </p>
              </div>
              <Button asChild variant="live">
                <Link href="/app">Start consult</Link>
              </Button>
            </div>
          </header>

          <section className="rounded-xl border border-border bg-surface-1 p-5">
            <p className="ds-eyebrow text-ink-dim">Latest visit</p>
            <h2 className="mt-3 text-lg font-medium text-ink">{patient.reason}</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">{patient.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href={`/records/${patient.recordId}`}>
                  <ShieldCheck className="size-4" />
                  Open verified record
                </Link>
              </Button>
              <Button variant="outline">
                <MessageSquare className="size-4" />
                Send summary
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface-1">
            <div className="border-b border-border px-5 py-4">
              <p className="ds-eyebrow text-ink-dim">Timeline</p>
            </div>
            <div className="divide-y divide-border">
              {[patient.reason, "Patient summary generated", "0G receipt verified"].map((item, index) => (
                <div key={item} className="flex gap-3 px-5 py-4">
                  <span className="mt-1 size-2 rounded-full bg-jade" />
                  <div>
                    <p className="text-sm text-ink">{item}</p>
                    <p className="mt-1 ds-mono text-[11px] text-ink-dim">
                      {index === 0 ? patient.lastVisit : "same visit"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="ds-eyebrow text-ink-dim">Documents</p>
            <div className="mt-3 space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded-md border border-border bg-surface-3 p-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    <FileText className="size-4 text-jade" />
                    {doc.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">{doc.type} · {doc.status}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="ds-eyebrow text-ink-dim">Tasks</p>
            <div className="mt-3 space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-border bg-surface-3 p-3">
                  <p className="text-sm text-ink">{task.title}</p>
                  <p className="mt-1 ds-mono text-[11px] text-ink-dim">{task.due}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
