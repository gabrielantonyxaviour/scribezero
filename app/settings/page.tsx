"use client";

import Link from "next/link";
import { Database, FileText, Hospital, Languages, RotateCcw, ShieldCheck, Wallet } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { Copyable } from "@/components/sz/copyable";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { useWallet } from "@/components/providers/wallet-provider";
import { useDoctorProfile, useOnboarding } from "@/lib/onboarding/store";
import { NETWORK, COMPUTE } from "@/lib/constants";
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

export default function SettingsPage() {
  return (
    <RequireDoctor>
      <Settings />
    </RequireDoctor>
  );
}

function Settings() {
  const { address } = useWallet();
  const { profile, reset } = useOnboarding();
  const doctor = useDoctorProfile();
  const mode = doctor.profileStorageMode;

  return (
    <AppShell className="max-w-[1040px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Settings</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Clinic controls</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Doctor identity, wallet ownership, and live 0G readiness in one place.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Panel title="Doctor profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info icon={<Hospital className="size-4" />} label="Doctor" value={doctor.name} />
              <Info icon={<FileText className="size-4" />} label="Specialty" value={doctor.role} />
              <Info icon={<Languages className="size-4" />} label="Languages" value={doctor.languageLine} />
              <Info icon={<ShieldCheck className="size-4" />} label="Credentials" value={doctor.credentials} />
            </div>
          </Panel>

          <Panel title="Clinic profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info icon={<Hospital className="size-4" />} label="Clinic" value={doctor.clinic} />
              <Info icon={<Database className="size-4" />} label="City" value={doctor.city || "City not set"} />
              <Info
                icon={<FileText className="size-4" />}
                label="Motivation"
                value={profile?.motivation || "Motivation not set"}
              />
              <Info
                icon={<ShieldCheck className="size-4" />}
                label="Sample consult"
                value={profile?.sampleConsultReviewed ? "Reviewed before seal" : "Ready to review"}
              />
            </div>
          </Panel>

          <Panel title="Data controls">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/onboarding?rerun=1">
                  <FileText className="size-4" />
                  Re-run onboarding
                </Link>
              </Button>
              <Button type="button" variant="outline" className="text-amber" onClick={reset}>
                <RotateCcw className="size-4" />
                Reset local profile
              </Button>
            </div>
            <p className="mt-3 text-sm text-ink-muted">
              Records and practice profiles are wallet-owned. Local reset clears the browser
              profile only; live 0G roots remain verifiable by root hash.
            </p>
          </Panel>
        </div>

        <aside className="flex flex-col gap-5">
          <Panel title="Wallet owner">
            <div className="flex items-center gap-3">
              <OwnerAvatar address={address || ""} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">Record owner</p>
                <p className="ds-mono mt-1 truncate text-[12px] text-ink-muted">
                  {address ? truncAddress(address) : "Wallet resolving"}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="PracticeProfile receipt">
            <div className="flex flex-col gap-3">
              <span className="ds-mono w-fit rounded-full border border-jade/30 bg-jade-soft px-2 py-1 text-[10px] text-jade">
                {mode === "live" && doctor.profileRegistryTxHash
                  ? "0G Storage + Chain live"
                  : "profile not registered"}
              </span>
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
              {doctor.profileStoredAt && (
                <p className="ds-mono text-[11px] text-ink-dim">
                  stored {new Date(doctor.profileStoredAt).toLocaleString()}
                </p>
              )}
              {doctor.profileRegistryTxHash ? (
                <Copyable
                  value={doctor.profileRegistryTxHash}
                  display={`registry tx ${truncHash(doctor.profileRegistryTxHash)}`}
                  label="Registry transaction copied"
                  className="text-[12px]"
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  Complete onboarding to register the profile root on 0G Chain.
                </p>
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

          <Panel title="0G readiness">
            <div className="flex flex-col gap-3 text-sm text-ink-muted">
              <Info icon={<Database className="size-4" />} label="Storage" value={NETWORK.indexer} compact />
              <Info icon={<ShieldCheck className="size-4" />} label="Compute" value={`${COMPUTE.mode} · ${COMPUTE.router}`} compact />
              <Info icon={<Wallet className="size-4" />} label="Network" value={NETWORK.chainLabel} compact />
            </div>
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}

function Info({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-jade">{icon}</span>
      <div className="min-w-0">
        <p className="ds-mono text-[10px] uppercase text-ink-dim">{label}</p>
        <p className={compact ? "truncate text-xs text-ink-muted" : "mt-1 text-sm text-ink"}>
          {value}
        </p>
      </div>
    </div>
  );
}
