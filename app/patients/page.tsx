"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Users } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { PatientCreateDialog } from "@/components/patients/patient-create-dialog";
import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Copyable } from "@/components/sz/copyable";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatientIndexEntry } from "@/lib/patients/kv-index";

type LoadState = "idle" | "loading" | "ready" | "error";

function short(value: string, start = 10, end = 6) {
  if (!value) return "";
  return value.length <= start + end ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `${res.status} ${res.statusText}`);
  return body as T;
}

export default function PatientsPage() {
  return (
    <RequireDoctor>
      <PatientsWorkspace />
    </RequireDoctor>
  );
}

function PatientsWorkspace() {
  const wallet = useWallet();
  const [patients, setPatients] = useState<PatientIndexEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    if (!wallet.address) return;
    setLoadState("loading");
    setError("");
    try {
      const data = await fetch(`/api/patients/index?owner=${wallet.address}`, {
        cache: "no-store",
      }).then((res) => readJson<{ patients: PatientIndexEntry[] }>(res));
      setPatients(data.patients);
      setLoadState("ready");
    } catch (err) {
      setError((err as Error).message);
      setLoadState("error");
    }
  }, [wallet.address]);

  useEffect(() => {
    let active = true;
    if (!wallet.address) return;
    fetch(`/api/patients/index?owner=${wallet.address}`, { cache: "no-store" })
      .then((res) => readJson<{ patients: PatientIndexEntry[] }>(res))
      .then((data) => {
        if (!active) return;
        setPatients(data.patients);
        setLoadState("ready");
      })
      .catch((err) => {
        if (!active) return;
        setError((err as Error).message);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [wallet.address]);

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [patients],
  );

  return (
    <AppShell>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ds-eyebrow text-jade">0G patient index</p>
          <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">Patients</h1>
          <p className="mt-2 max-w-[620px] text-sm text-ink-muted">
            Create encrypted patient artifacts on 0G Storage and index only proof handles in 0G KV.
          </p>
        </div>
        <PatientCreateDialog onCreated={loadPatients} />
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-ink-dim">
        <Badge variant="outline" className="border-jade/30 bg-jade-soft text-jade">
          0G Storage encrypted
        </Badge>
        <Badge variant="outline" className="border-jade/30 bg-jade-soft text-jade">
          0G KV indexed
        </Badge>
        <span className="ds-mono">owner {short(wallet.address)}</span>
      </div>

      {loadState === "error" ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-ink">
          0G KV patient read failed: {error}
        </div>
      ) : loadState === "loading" ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-surface-1 text-ink-muted">
          <Loader2 className="mr-2 size-4 animate-spin text-jade" />
          Loading 0G patient index
        </div>
      ) : sortedPatients.length === 0 ? (
        <RealDataEmptyState
          icon={Users}
          title="No 0G-indexed patients yet"
          body="Create a patient to encrypt the profile into 0G Storage and write a proof-only row into 0G KV."
          primaryLabel="Start consult"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>0G Storage root</TableHead>
                <TableHead>Commitment</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell>
                    <Link href={`/patients/${patient.patientId}`} className="font-medium text-ink hover:text-jade">
                      {patient.patientId}
                    </Link>
                  </TableCell>
                  <TableCell>{patient.preferredLanguage.toUpperCase()}</TableCell>
                  <TableCell>
                    <Copyable value={patient.storageRootHash} display={short(patient.storageRootHash)} />
                  </TableCell>
                  <TableCell>
                    <Copyable value={patient.patientCommitment} display={short(patient.patientCommitment)} />
                  </TableCell>
                  <TableCell>{new Date(patient.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
