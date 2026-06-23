"use client";

import {
  ArrowRight,
  Database,
  FileCheck2,
  Languages,
  Loader2,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { truncAddress, truncHash } from "@/lib/format";
import type { DoctorProfile } from "@/lib/onboarding/store";

export type ProfileSealState =
  | { status: "idle" }
  | {
      status: "sealing";
      stage: "checking" | "storage" | "signature" | "registry" | "confirming";
      message: string;
    }
  | {
      status: "sealed";
      mode: "live";
      rootHash: string;
      txHash?: string;
      storedAt: string;
      artifactHash: `0x${string}`;
      registryAddress: `0x${string}`;
      registryTxHash: `0x${string}`;
      registryBlockNumber: number;
    }
  | { status: "error"; message: string };

export function StepCelebration({
  profile,
  address,
  seal,
  onSeal,
  onComplete,
}: {
  profile: DoctorProfile;
  address: string;
  seal: ProfileSealState;
  onSeal: () => void;
  onComplete: (dest: "/app" | "/dashboard") => void;
}) {
  const sealed = seal.status === "sealed";
  const sealing = seal.status === "sealing";
  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="ds-eyebrow text-jade">Step 5 of 5</p>
        <h1 className="ds-display mt-2 text-[44px] leading-[1.02] text-ink">
          Seal your practice profile.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-muted">
          This creates a PracticeProfile JSON artifact, stores it on 0G Storage, then asks your
          wallet to register that Storage root on 0G Chain.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border-strong bg-surface-1">
        <div className="flex items-center gap-3 border-b border-border bg-surface-3 px-4 py-3">
          <ShieldCheck className="size-4 shrink-0 text-jade" />
          <div className="min-w-0">
            <p className="ds-eyebrow text-ink-dim">record owner</p>
            <div className="mt-1 flex items-center gap-2">
              <OwnerAvatar address={address} size={20} />
              <span className="ds-mono truncate text-[13px] text-ink">
                {address ? truncAddress(address) : "wallet"}
              </span>
            </div>
          </div>
        </div>
        <dl className="divide-y divide-border">
          <Row icon={<Stethoscope className="size-4" />} label="Doctor" value={profile.name} />
          <Row icon={<ShieldCheck className="size-4" />} label="Clinic" value={profile.clinic} />
          <Row
            icon={<Languages className="size-4" />}
            label="Languages"
            value={profile.languages.join(", ")}
          />
          <Row
            icon={<Database className="size-4" />}
            label="Council"
            value={profile.registrationCouncil}
          />
        </dl>
      </div>

      {seal.status === "sealed" && (
        <div className="rounded-xl border border-jade/25 bg-[#10160f] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Practice profile live on 0G</p>
              <p className="ds-mono mt-1 text-[11px] text-ink-dim">
                0G Storage returned a Merkle root; your wallet registered it on 0G Chain
              </p>
            </div>
            <span className="ds-mono rounded-full border border-jade/30 bg-jade-soft px-2 py-1 text-[10px] text-jade">
              live
            </span>
          </div>
          <dl className="mt-4 flex flex-col gap-2">
            <Line label="profile root" value={truncHash(seal.rootHash)} />
            {seal.txHash ? <Line label="storage tx" value={truncHash(seal.txHash)} /> : null}
            <Line label="artifact hash" value={truncHash(seal.artifactHash)} />
            <Line label="registry" value={truncAddress(seal.registryAddress)} />
            <Line label="registry tx" value={truncHash(seal.registryTxHash)} />
            <Line label="block" value={String(seal.registryBlockNumber)} />
            <Line label="stored at" value={new Date(seal.storedAt).toLocaleString()} />
          </dl>
        </div>
      )}

      {sealing && (
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-jade" />
            <p className="text-sm font-medium text-ink">{seal.message}</p>
          </div>
          <dl className="mt-4 flex flex-col gap-2">
            <PendingLine active={seal.stage === "storage"} label="0G Storage upload" />
            <PendingLine active={seal.stage === "signature"} label="Wallet signature request" />
            <PendingLine active={seal.stage === "registry"} label="0G Chain transaction" />
            <PendingLine active={seal.stage === "confirming"} label="On-chain confirmation" />
          </dl>
        </div>
      )}

      {seal.status === "error" && (
        <p className="rounded-lg border border-amber/30 bg-amber-soft px-3 py-2 text-sm text-amber">
          {seal.message} Fix the 0G error and retry; this profile is not complete until the seal succeeds.
        </p>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {!sealed ? (
          <Button
            type="button"
            variant="live"
            size="lg"
            disabled={sealing}
            className="px-7"
            onClick={onSeal}
          >
            {sealing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sealing profile
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                Create 0G profile seal
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="live"
              size="lg"
              className="px-7"
              onClick={() => onComplete("/app")}
            >
              Open the scribe
              <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => onComplete("/dashboard")}
            >
              Go to dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function PendingLine({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {active ? (
        <Loader2 className="size-3.5 animate-spin text-jade" />
      ) : (
        <FileCheck2 className="size-3.5 text-ink-dim" />
      )}
      <span className={active ? "text-sm text-ink" : "text-sm text-ink-muted"}>{label}</span>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-jade">{icon}</span>
      <dt className="ds-mono w-24 shrink-0 text-[11px] uppercase text-ink-dim">{label}</dt>
      <dd className="min-w-0 flex-1 truncate text-sm text-ink">{value || "Not provided"}</dd>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="ds-mono text-[11px] text-ink-dim">{label}</dt>
      <dd className="ds-mono truncate text-[12px] text-jade">{value}</dd>
    </div>
  );
}
