"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Database, Loader2, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copyable } from "@/components/sz/copyable";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";
import { useWallet } from "@/components/providers/wallet-provider";
import { truncAddress, truncHash } from "@/lib/format";
import type { RecordIndexEntry } from "@/lib/records/kv-index";

export default function RecordDetailPage() {
  return (
    <RequireDoctor>
      <RecordDetail />
    </RequireDoctor>
  );
}

function RecordDetail() {
  const params = useParams<{ id: string }>();
  const noteId = params.id;
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

  const record = useMemo(
    () => records.find((entry) => entry.noteId === noteId) || null,
    [noteId, records],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="ds-eyebrow">Record lookup</p>
            <h1 className="ds-display mt-1.5 text-[30px] text-ink">{noteId}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Record details come from the 0G KV proof index. Clinical plaintext stays encrypted in 0G Storage.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/records">Close</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-1 p-4 text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin text-jade" />
            Reading 0G KV record index
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber/30 bg-amber-soft p-4 text-sm text-amber">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">0G KV index unavailable</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : record ? (
          <section className="rounded-xl border border-border bg-surface-1">
            <div className="border-b border-border px-4 py-3">
              <p className="ds-eyebrow text-ink-dim">0G proof handles</p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Info label="Owner" value={truncAddress(record.ownerAddress)} copy={record.ownerAddress} />
              <Info label="Share code" value={record.shareCode} />
              <Info label="Storage root" value={truncHash(record.storageRootHash)} copy={record.storageRootHash} />
              <Info label="Storage tx" value={record.storageTxHash ? truncHash(record.storageTxHash) : "Not set"} copy={record.storageTxHash} />
              <Info label="TEE proof" value={truncHash(record.teeTlsProof)} copy={record.teeTlsProof} />
              <Info label="Note hash" value={truncHash(record.noteHash)} copy={record.noteHash} />
              <Info label="Created" value={new Date(record.createdAt).toLocaleString()} />
              <Info label="Indexed" value={new Date(record.indexedAt).toLocaleString()} />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
              <Badge variant="outline" className="border-jade/30 text-jade">
                Compute {record.proof.computeMode}
              </Badge>
              <Badge variant="outline" className="border-jade/30 text-jade">
                Storage {record.proof.storageMode}
              </Badge>
              <Badge variant="outline" className="border-border text-ink-muted">
                Chain {record.chainId || 16602}
              </Badge>
            </div>
          </section>
        ) : (
          <RealDataEmptyState
            icon={Database}
            title="Record not indexed"
            body="No 0G KV entry exists for this note id under the connected wallet."
            detail="Use the verifier if you have a raw 0G Storage root, or create a new consultation to generate a wallet-owned KV index entry."
            primaryHref="/verify"
            primaryLabel="Verify by root"
          />
        )}

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-dim">
          <ShieldCheck className="size-3.5 text-jade" /> This route displays proof handles only, not decrypted clinical note text.
        </p>
      </div>
    </AppShell>
  );
}

function Info({ label, value, copy }: { label: string; value: string; copy?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface-3 p-3">
      <p className="ds-eyebrow text-ink-dim">{label}</p>
      {copy ? (
        <Copyable
          value={copy}
          display={value}
          label={`${label} copied`}
          className="mt-1 max-w-full truncate text-[12px]"
        />
      ) : (
        <p className="ds-mono mt-1 truncate text-[12px] text-ink">{value}</p>
      )}
    </div>
  );
}
