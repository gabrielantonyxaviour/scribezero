import Link from "next/link";
import { ArrowUpRight, CircleAlert, UserPlus } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { PATIENTS } from "@/lib/mock/product";

function riskClass(risk: string) {
  if (risk === "urgent") return "border-vermillion/40 text-vermillion";
  if (risk === "watch") return "border-amber/40 text-amber";
  return "border-border text-ink-muted";
}

export default function PatientsPage() {
  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ds-eyebrow text-jade">Patient list</p>
          <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Patients</h1>
          <p className="mt-2 text-sm text-ink-muted">
            A lightweight clinic panel for consult history, language, and owned records.
          </p>
        </div>
        <Button variant="outline">
          <UserPlus className="size-4" />
          New patient
        </Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="grid grid-cols-[1fr_110px_110px_44px] gap-3 border-b border-border px-4 py-3 max-sm:hidden">
          {["Patient", "Language", "Risk", ""].map((heading) => (
            <span key={heading} className="ds-eyebrow text-ink-dim">
              {heading}
            </span>
          ))}
        </div>
        <div className="divide-y divide-border">
          {PATIENTS.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="grid gap-3 px-4 py-4 transition-colors hover:bg-surface-2 sm:grid-cols-[1fr_110px_110px_44px] sm:items-center"
            >
              <div>
                <p className="text-sm font-medium text-ink">{patient.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {patient.age}{patient.sex} · {patient.reason}
                </p>
              </div>
              <span className="text-sm text-ink-muted">{patient.language}</span>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2 py-1 text-xs ${riskClass(patient.risk)}`}>
                {patient.risk === "watch" ? <CircleAlert className="size-3" /> : null}
                {patient.risk}
              </span>
              <ArrowUpRight className="size-4 text-ink-dim sm:justify-self-end" />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
