"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  CircleCheck,
  Download,
  ExternalLink,
  FileDown,
  Share2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OwnerAvatar } from "@/components/sz/owner-avatar";
import { LiveDot } from "@/components/sz/live-dot";
import { Copyable } from "@/components/sz/copyable";
import { CheckRow } from "@/components/sz/check-row";
import {
  DEMO_NOTE,
  DEMO_PROOF,
  DEMO_RECORD,
  DEMO_SEGMENTS,
} from "@/lib/mock/data";
import { NETWORK, COMPUTE } from "@/lib/constants";
import { formatIST, truncAddress, truncHash, truncMid } from "@/lib/format";

const SOAP = [
  { k: "S · Subjective", v: DEMO_NOTE.subjective },
  { k: "O · Objective", v: DEMO_NOTE.objective },
  { k: "A · Assessment", v: DEMO_NOTE.assessment },
  { k: "P · Plan", v: DEMO_NOTE.plan },
] as const;

const PROOF_ROWS = [
  { label: "model", value: DEMO_PROOF.model, full: DEMO_PROOF.model },
  { label: "request hash", value: truncHash(DEMO_PROOF.requestHash), full: DEMO_PROOF.requestHash },
  { label: "response hash", value: truncHash(DEMO_PROOF.responseHash), full: DEMO_PROOF.responseHash },
  { label: "provider TLS fingerprint", value: truncMid(DEMO_PROOF.providerTlsFingerprint, 8, 4), full: DEMO_PROOF.providerTlsFingerprint },
  { label: "TEE measurement", value: DEMO_PROOF.teeMeasurement, full: DEMO_PROOF.teeMeasurement },
  { label: "routing signature", value: truncHash(DEMO_PROOF.routingSignature), full: DEMO_PROOF.routingSignature },
];

export default function RecordDetailPage() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [dest, setDest] = useState("");
  const valid = /^0x[0-9a-fA-F]{40}$/.test(dest.trim());
  const showError = dest.trim().length > 0 && !valid;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="ds-eyebrow">Consultation · {DEMO_NOTE.consultationCode}</p>
            <h1 className="ds-display mt-1.5 text-[30px] text-ink">Fever, dry cough &amp; body ache</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="ds-mono text-ink-muted">ta-IN</Badge>
              <Badge variant="outline" className="ds-mono text-ink-muted">en-IN</Badge>
              <span className="ds-mono text-[11px] text-ink-dim">{formatIST(DEMO_NOTE.createdAt)}</span>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/records">
              <X /> Close
            </Link>
          </Button>
        </div>

        {/* owner + seal */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-jade/25 bg-[#10160f] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full border border-jade/40 bg-surface-2">
              <CircleCheck className="size-4 text-jade" />
            </span>
            <div>
              <div className="text-sm font-medium text-ink">Verified &amp; owned on 0G</div>
              <div className="ds-mono text-[11px] text-ink-dim">
                Generated in 0G Compute TeeTLS · persisted on 0G Storage
              </div>
            </div>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-2.5 py-1">
            <OwnerAvatar address={DEMO_RECORD.ownerAddress} size={18} />
            <Copyable value={DEMO_RECORD.ownerAddress} display={truncAddress(DEMO_RECORD.ownerAddress)} label="Owner copied" className="text-[11px]" />
          </span>
        </div>

        {/* summary */}
        <p className="mt-5 text-[15px] leading-relaxed text-ink-muted">{DEMO_NOTE.summary}</p>

        {/* SOAP */}
        <div className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {SOAP.map((b) => (
            <div key={b.k}>
              <p className="ds-mono mb-1.5 text-[10px] uppercase tracking-[0.12em] text-ink-dim">{b.k}</p>
              <p className="text-[13px] leading-relaxed text-ink">{b.v}</p>
            </div>
          ))}
        </div>

        {/* tabs */}
        <Tabs defaultValue="proof" className="mt-7">
          <TabsList>
            <TabsTrigger value="proof">Proof</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          <TabsContent value="proof" className="mt-4">
            <div className="rounded-xl border border-border bg-surface-1 p-4">
              <p className="ds-eyebrow !text-ink-dim">TeeTLS routing proof · 0G Compute</p>
              <div className="mt-3 divide-y divide-border">
                {PROOF_ROWS.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="ds-mono text-[11px] text-ink-dim">{r.label}</span>
                    <Copyable value={r.full} display={r.value} className="text-[11px]" label={`${r.label} copied`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-1 p-4">
              <div className="flex items-center gap-3">
                <span className="ds-eyebrow !text-ink-dim">0G Storage · Merkle root (withProof)</span>
              </div>
              <div className="flex items-center gap-3">
                <Copyable value={DEMO_RECORD.zgStorageRootHash} display={truncHash(DEMO_RECORD.zgStorageRootHash)} label="Storage root copied" className="text-[12px]" />
                <a href={NETWORK.explorer} target="_blank" rel="noreferrer" className="text-ink-dim hover:text-jade">
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="mt-4">
            <div className="rounded-xl border border-border bg-surface-1 px-4 py-1">
              <div className="divide-y divide-border">
                <CheckRow
                  title="Note hash matches"
                  detail="Re-computed keccak256 equals the value stored on 0G."
                  value={truncHash(DEMO_NOTE.noteHash)}
                />
                <CheckRow
                  title="TeeTLS routing proof valid"
                  detail="Signed inside the TEE — binds request, response and provider."
                  subFacts={[
                    { label: "Generated inside a TEE — attestation present", value: `${COMPUTE.attestation} · 0G Compute` },
                    { label: "Provider TLS fingerprint matched", value: truncMid(DEMO_PROOF.providerTlsFingerprint, 8, 4) },
                  ]}
                />
                <CheckRow
                  title="0G Storage reachable"
                  detail="Merkle root resolves on the testnet turbo indexer."
                  value="3 nodes"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transcript" className="mt-4">
            <div className="overflow-hidden rounded-xl border border-border bg-surface-3">
              <div className="grid grid-cols-2">
                <div className="space-y-3 border-r border-border px-4 py-3">
                  <p className="ds-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim">தமிழ் · ta-IN</p>
                  {DEMO_SEGMENTS.map((s) => (
                    <p key={s.id} className="text-[13px] leading-relaxed text-ink">
                      <span className="ds-mono mb-0.5 block text-[9px] text-ink-dim">{s.speaker.toUpperCase()}</span>
                      {s.native}
                    </p>
                  ))}
                </div>
                <div className="space-y-3 px-4 py-3">
                  <p className="ds-mono text-[9px] uppercase tracking-[0.1em] text-ink-dim">English · en-IN</p>
                  {DEMO_SEGMENTS.map((s) => (
                    <p key={s.id} className="text-[13px] leading-relaxed text-ink-muted">
                      <span className="ds-mono mb-0.5 block text-[9px] text-ink-dim">{s.speaker.toUpperCase()}</span>
                      {s.english}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/r/HX7K2M"><Share2 /> Share record</Link>
          </Button>
          <Button variant="outline" size="sm"><FileDown /> Export PDF · JSON</Button>
          <Button variant="outline" size="sm"><Download /> Download from 0G</Button>
          <Button variant="outline" size="sm" className="text-amber" onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft /> Transfer ownership
          </Button>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-ink-dim">
          <LiveDot size={5} /> Record live on {NETWORK.name}
        </p>
      </div>

      {/* transfer dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <p className="ds-eyebrow !text-ink-dim">Transfer ownership · 0G record</p>
            <DialogTitle className="ds-display text-2xl text-ink">Re-bind this record</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            The destination address becomes the owner bound to Merkle root{" "}
            <span className="ds-mono text-ink">{truncHash(DEMO_RECORD.zgStorageRootHash)}</span>. This record will leave your library.
          </p>
          <div className="space-y-1.5">
            <label className="ds-mono text-[11px] text-ink-dim">Destination address</label>
            <Input
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              placeholder="0x…"
              className="ds-mono"
              aria-invalid={showError}
            />
            {showError && (
              <p className="flex items-center gap-1.5 text-[11px] text-vermillion">
                <AlertTriangle className="size-3" /> Not a valid 0G address — expecting 42 hex characters.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button variant="live" size="sm" disabled={!valid}>
              <ArrowRightLeft /> Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
