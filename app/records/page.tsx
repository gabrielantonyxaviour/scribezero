"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Database, FileText, Loader2, Mic, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { NewConsultationCard } from "@/components/sz/new-consultation-card";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";
import { Copyable } from "@/components/sz/copyable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWallet } from "@/components/providers/wallet-provider";
import { truncHash } from "@/lib/format";
import type { RecordIndexEntry } from "@/lib/records/kv-index";

export default function RecordsPage() {
  return (
    <RequireDoctor>
      <Records />
    </RequireDoctor>
  );
}

function Records() {
  const { address } = useWallet();
  const [records, setRecords] = useState<RecordIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) return;
    let active = true;
    fetch(`/api/records/index?owner=${encodeURIComponent(address)}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || `0G KV index returned ${res.status}`);
        return body as { records: RecordIndexEntry[] };
      })
      .then((body) => {
        if (active) {
          setRecords(body.records || []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [address]);

  return (
    <AppShell className="max-w-[980px]">
      <header className="mb-6">
        <h1 className="ds-display text-[34px] leading-[1.04] text-ink">My Records</h1>
        <p className="mt-1 text-[13px] text-ink-muted">
          Encrypted 0G Storage records, listed from the wallet-owned 0G KV proof index.
        </p>
      </header>

      <NewConsultationCard />

      {loading ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-surface-1 p-4 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin text-jade" />
          Reading 0G KV record index
        </div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-amber/30 bg-amber-soft p-4 text-sm text-amber">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">0G KV index unavailable</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : records.length ? (
        <section className="mt-5 overflow-hidden rounded-xl border border-border bg-surface-1">
          <div className="border-b border-border px-4 py-3">
            <p className="ds-eyebrow text-ink-dim">0G KV index</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Storage root</TableHead>
                <TableHead className="text-right">Opened</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={`${record.ownerAddress}:${record.noteId}`}>
                  <TableCell>
                    <div className="min-w-[180px]">
                      <Link
                        href={`/records/${record.noteId}`}
                        className="font-medium text-ink hover:text-jade"
                      >
                        {record.consultationCode}
                      </Link>
                      <p className="ds-mono mt-1 text-[11px] text-ink-dim">{record.noteId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="border-jade/30 text-jade">
                        Compute {record.proof.computeMode}
                      </Badge>
                      <Badge variant="outline" className="border-jade/30 text-jade">
                        Storage {record.proof.storageMode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Copyable
                      value={record.storageRootHash}
                      display={truncHash(record.storageRootHash)}
                      label="Storage root copied"
                      className="text-[12px]"
                    />
                  </TableCell>
                  <TableCell className="text-right text-xs text-ink-muted">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ) : (
        <RealDataEmptyState
          icon={Database}
          title="No indexed records yet"
          body="Create a real consultation. After 0G Compute, encrypted 0G Storage, verification, and KV indexing all succeed, the proof handles will appear here."
          detail="Clinical plaintext is not stored in the KV index; only owner, share code, hashes, roots, proof ids, and timestamps are indexed."
          primaryLabel="Create encrypted record"
        />
      )}

      <div className="mt-5 flex flex-col gap-2 rounded-xl border border-border bg-surface-1 p-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-jade" />
          Have a real 0G root already?
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href="/verify">
            <FileText className="size-4" />
            Verify by root
          </Link>
        </Button>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button asChild variant="live">
          <Link href="/app">
            <Mic className="size-4" />
            Start a consultation
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
