"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Database, Loader2, ShieldCheck } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Copyable } from "@/components/sz/copyable";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatientIndexEntry } from "@/lib/patients/kv-index";

function short(value: string, start = 12, end = 8) {
  if (!value) return "";
  return value.length <= start + end ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `${res.status} ${res.statusText}`);
  return body as T;
}

export default function PatientDetailPage() {
  return (
    <RequireDoctor>
      <PatientDetailWorkspace />
    </RequireDoctor>
  );
}

function PatientDetailWorkspace() {
  const { id } = useParams<{ id: string }>();
  const wallet = useWallet();
  const [patient, setPatient] = useState<PatientIndexEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!wallet.address || !id) return;
    fetch(`/api/patients/index?owner=${wallet.address}&patientId=${id}`, { cache: "no-store" })
      .then((res) => readJson<{ patient: PatientIndexEntry | null }>(res))
      .then((data) => {
        if (!active) return;
        setPatient(data.patient);
      })
      .catch((err) => {
        if (!active) return;
        setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [wallet.address, id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Button asChild variant="ghost" className="mb-5">
          <Link href="/patients">
            <ArrowLeft className="size-4" />
            Patients
          </Link>
        </Button>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-surface-1 text-ink-muted">
            <Loader2 className="mr-2 size-4 animate-spin text-jade" />
            Loading 0G patient proof
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-ink">
            0G KV patient read failed: {error}
          </div>
        ) : !patient ? (
          <RealDataEmptyState
            icon={Database}
            title="Patient not indexed"
            body="This wallet has no 0G KV patient entry for that id."
            detail="Patient charts load only from encrypted 0G Storage artifacts discovered through the connected wallet's 0G KV index."
            primaryHref="/patients"
            primaryLabel="Back to patients"
          />
        ) : (
          <>
            <header className="mb-6 rounded-xl border border-border bg-surface-1 p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-jade/30 bg-jade-soft text-jade">
                  0G patient artifact
                </Badge>
                <Badge variant="outline" className="border-jade/30 bg-jade-soft text-jade">
                  Non-transferable clinic record
                </Badge>
              </div>
              <p className="ds-eyebrow text-jade">Patient proof</p>
              <h1 className="ds-display mt-2 break-all text-[38px] leading-none text-ink">
                {patient.patientId}
              </h1>
              <p className="mt-2 max-w-[680px] text-sm text-ink-muted">
                ScribeZero stores the patient profile as an encrypted 0G Storage artifact. This
                page reads the owner-scoped 0G KV index and shows only proof handles.
              </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <ProofCard label="Owner wallet" value={patient.ownerAddress} />
              <ProofCard label="0G Storage root" value={patient.storageRootHash} />
              <ProofCard label="Storage transaction" value={patient.storageTxHash || ""} />
              <ProofCard label="Patient commitment" value={patient.patientCommitment} />
              <ProofCard label="Ciphertext hash" value={patient.ciphertextHash} />
              <ProofCard label="Created" value={new Date(patient.createdAt).toLocaleString()} raw={false} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="live">
                <Link href={`/api/0g/download?root=${patient.storageRootHash}`} target="_blank">
                  <ShieldCheck className="size-4" />
                  Inspect encrypted artifact
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/app">Start consult</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ProofCard({ label, value, raw = true }: { label: string; value: string; raw?: boolean }) {
  return (
    <Card className="rounded-lg bg-surface-1">
      <CardHeader>
        <CardTitle className="text-sm text-ink-muted">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {value ? (
          raw ? (
            <Copyable value={value} display={short(value)} className="break-all text-sm" />
          ) : (
            <p className="text-sm text-ink">{value}</p>
          )
        ) : (
          <p className="text-sm text-ink-dim">Not returned by 0G Storage</p>
        )}
      </CardContent>
    </Card>
  );
}
