import Link from "next/link";
import { Check, Languages, Mic, ShieldCheck, UserRound } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { DOCTOR_PROFILE, ONBOARDING_STEPS } from "@/lib/mock/product";

const DETAILS = [
  { label: "Doctor", value: DOCTOR_PROFILE.name, icon: UserRound },
  { label: "Clinic", value: DOCTOR_PROFILE.clinic, icon: ShieldCheck },
  { label: "Languages", value: DOCTOR_PROFILE.languageLine, icon: Languages },
];

export default function OnboardingPage() {
  return (
    <AppShell className="max-w-[920px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Onboarding</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">
          Set up your scribe workspace.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          A short doctor-first setup. Confirm the basics, try a consult, and save one verified
          record.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="rounded-xl border border-border bg-surface-1">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm font-medium text-ink">Setup checklist</p>
          </div>
          <div className="divide-y divide-border">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex gap-4 px-5 py-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3">
                  {step.status === "done" ? (
                    <Check className="size-4 text-jade" />
                  ) : (
                    <span className="ds-mono text-xs text-ink-muted">{index + 1}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{step.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{step.body}</p>
                </div>
                <span className="ds-mono text-[11px] uppercase text-ink-dim">{step.status}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-surface-1 p-4">
            <p className="ds-eyebrow text-ink-dim">Profile</p>
            <div className="mt-4 space-y-4">
              {DETAILS.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border bg-surface-3 text-jade">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="ds-mono text-[10px] uppercase text-ink-dim">{item.label}</p>
                    <p className="mt-1 text-sm text-ink">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-jade-deep bg-jade-soft p-4">
            <Mic className="size-5 text-jade" />
            <p className="mt-3 text-sm font-medium text-ink">Ready for the first consult</p>
            <p className="mt-1 text-sm text-ink-muted">
              Run the sample visit and seal a demo record to complete setup.
            </p>
            <Button asChild variant="live" className="mt-4 w-full">
              <Link href="/app">Open scribe</Link>
            </Button>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
