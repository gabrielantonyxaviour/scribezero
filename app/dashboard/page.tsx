"use client";

import Link from "next/link";
import { CalendarClock, ClipboardList, Database, FileText, Mic, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { Copyable } from "@/components/sz/copyable";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";
import { useDoctorProfile } from "@/lib/onboarding/store";
import { truncAddress, truncHash } from "@/lib/format";

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
  return (
    <RequireDoctor>
      <Dashboard />
    </RequireDoctor>
  );
}

function Dashboard() {
  const doctor = useDoctorProfile();

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <header className="rounded-xl border border-border bg-surface-1 p-5">
            <p className="ds-eyebrow text-jade">Doctor workspace</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="ds-display text-[36px] leading-none text-ink">
                  Welcome, {doctor.name}.
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
            <RealDataEmptyState
              icon={CalendarClock}
              title="No indexed visits yet"
              body="New visits will appear here after their encrypted record roots are written to the real 0G index."
            />
          </Panel>

          <Panel title="Clinical tasks">
            <RealDataEmptyState
              icon={ClipboardList}
              title="No real follow-ups indexed"
              body="Follow-up tasks will be generated from encrypted patient artifacts once the 0G KV patient index is configured."
            />
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Clinic">
            <div className="space-y-3 text-sm">
              <Info icon={<ShieldCheck className="size-4" />} label={doctor.clinic} />
              {doctor.city && (
                <Info icon={<CalendarClock className="size-4" />} label={doctor.city} />
              )}
              <Info icon={<ClipboardList className="size-4" />} label={doctor.languageLine} />
            </div>
          </Panel>

          <Panel title="Practice seal">
            <div className="space-y-3 text-sm">
              <Info
                icon={<Database className="size-4" />}
                label={
                  doctor.profileStorageMode === "live" && doctor.profileRegistryTxHash
                    ? "0G Storage + Chain live"
                    : "Profile not registered on 0G Chain"
                }
              />
              {doctor.profileRootHash ? (
                <Copyable
                  value={doctor.profileRootHash}
                  display={`root ${truncHash(doctor.profileRootHash)}`}
                  label="Profile root copied"
                  className="text-[12px]"
                />
              ) : (
                <p className="text-sm text-ink-muted">Complete onboarding to create a profile root.</p>
              )}
              {doctor.profileRegistryTxHash && (
                <Copyable
                  value={doctor.profileRegistryTxHash}
                  display={`registry tx ${truncHash(doctor.profileRegistryTxHash)}`}
                  label="Registry transaction copied"
                  className="text-[12px]"
                />
              )}
              {doctor.profileRegistryAddress && (
                <Copyable
                  value={doctor.profileRegistryAddress}
                  display={`registry ${truncAddress(doctor.profileRegistryAddress)}`}
                  label="Registry address copied"
                  className="text-[12px]"
                />
              )}
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
