"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  CircleCheck,
  Lock,
  Info,
  Eye,
  ExternalLink,
  Share2,
  Loader2,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiveDot } from "@/components/sz/live-dot";
import { CheckRow } from "@/components/sz/check-row";
import { Copyable } from "@/components/sz/copyable";
import {
  DEMO_NOTE,
  DEMO_PROOF,
  DEMO_RECORD,
  DEMO_VERIFICATION,
  DEMO_CONSULT,
} from "@/lib/mock/data";
import { NETWORK, COMPUTE } from "@/lib/constants";
import {
  truncHash,
  truncMid,
  truncAddress,
  formatIST,
  LANGUAGE_LABEL,
} from "@/lib/format";

type Phase = "idle" | "checking" | "verified";

const PUBLIC_FACTS: { label: string; value: string; copy?: boolean }[] = [
  {
    label: "storage root",
    value: DEMO_RECORD.zgStorageRootHash,
    copy: true,
  },
  {
    label: "owner address",
    value: DEMO_RECORD.ownerAddress,
    copy: true,
  },
  {
    label: "created",
    value: formatIST(DEMO_NOTE.createdAt),
  },
  {
    label: "inference",
    value: "0G Compute · TeeTLS",
  },
  {
    label: "language",
    value: LANGUAGE_LABEL[DEMO_NOTE.language],
  },
  {
    label: "consultation",
    value: DEMO_CONSULT.code,
  },
];

export default function VerifyPage() {
  const [root, setRoot] = useState(DEMO_RECORD.zgStorageRootHash);
  const [phase, setPhase] = useState<Phase>("idle");

  function handleVerify() {
    if (phase === "checking") return;
    setPhase("checking");
    window.setTimeout(() => setPhase("verified"), 1400);
  }

  const checking = phase === "checking";
  const verified = phase === "verified";

  return (
    <AppShell walletless contained={false}>
      <div className="mx-auto w-full max-w-[660px] px-5 pb-16 pt-10 sm:pt-14">
        {/* Editorial hero */}
        <header className="text-center">
          <div className="ds-eyebrow inline-flex items-center gap-1.5 text-ink-muted">
            <ShieldCheck className="size-3.5" />
            public verifier · trustless
          </div>
          <h1 className="ds-display mt-4 text-[40px] leading-[1.04] text-ink sm:text-[44px]">
            Prove a record without
            <br />
            reading it.
          </h1>
          <p className="mx-auto mt-3.5 max-w-[452px] text-[15px] leading-relaxed text-ink-muted">
            Paste a 0G Storage root or a proof receipt. ScribeZero re-checks its
            integrity on-chain. The note stays encrypted and owned by the
            patient.
          </p>
        </header>

        {/* Verify card */}
        <section className="mt-7 rounded-xl border border-border bg-surface-1 p-4 sm:p-[18px]">
          <Label
            htmlFor="verify-root"
            className="ds-eyebrow mb-2.5 block text-ink-dim"
          >
            0G storage root or proof receipt
          </Label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col items-stretch gap-2.5 sm:flex-row"
          >
            <Input
              id="verify-root"
              value={root}
              onChange={(e) => {
                setRoot(e.target.value);
                if (phase === "verified") setPhase("idle");
              }}
              spellCheck={false}
              autoComplete="off"
              placeholder="Paste a 0G storage root or proof receipt…"
              className="ds-mono h-[46px] flex-1 bg-surface-3 text-[13px] text-ink"
            />
            <Button
              type="submit"
              variant="live"
              size="lg"
              disabled={checking}
              className="h-[46px] shrink-0 px-[22px]"
            >
              {checking ? (
                <>
                  <Loader2 className="size-[18px] animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <CircleCheck className="size-[18px]" />
                  Verify on 0G
                </>
              )}
            </Button>
          </form>
          <div className="mt-3 flex items-start gap-2 text-[13px] leading-snug text-ink-dim">
            <Info className="mt-px size-3.5 shrink-0" />
            <span>
              Accepts a <span className="ds-mono text-ink-muted">0x…</span>{" "}
              Merkle root or a{" "}
              <span className="ds-mono text-ink-muted">scribe.proof</span>{" "}
              receipt. Nothing you paste is stored.
            </span>
          </div>
        </section>

        {/* Verified result */}
        {verified ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Result header */}
            <div className="mb-3.5 mt-7 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2.5">
                <LiveDot size={8} />
                <span className="text-[15px] font-medium text-ink">
                  Verified
                </span>
                <span className="ds-mono rounded-full border border-jade/30 bg-jade-soft px-2.5 py-0.5 text-[11px] text-jade">
                  3 / 3 checks passed
                </span>
              </div>
              <span className="ds-mono text-[11px] text-ink-dim">
                verified in 1.84s
              </span>
            </div>

            {/* Three checks */}
            <div className="divide-y divide-border rounded-xl border border-border bg-surface-1 px-[18px]">
              <CheckRow
                title="Note hash matches"
                detail="Re-computed SHA-256 equals the value stored on 0G."
                value={truncHash(DEMO_NOTE.noteHash)}
              />
              <CheckRow
                title="TeeTLS routing proof valid"
                detail="Signed inside the TEE — binds request, response and provider TLS."
                value={`sig ${truncMid(DEMO_PROOF.routingSignature, 4, 2)}`}
                subFacts={[
                  {
                    label: "Generated inside a TEE — attestation present",
                    value: `${COMPUTE.attestation} · 0G Compute`,
                  },
                  {
                    label: "Provider TLS fingerprint matched",
                    value: truncMid(DEMO_PROOF.providerTlsFingerprint, 8, 4),
                  },
                ]}
              />
              <CheckRow
                title="0G Storage reachable"
                detail="Merkle root resolves on the testnet turbo indexer."
                value="3 nodes"
              />
            </div>

            {/* The only public facts */}
            <div className="mt-[18px] rounded-xl border border-border bg-surface-2 p-4 sm:p-[18px]">
              <div className="ds-eyebrow mb-4 flex items-center gap-1.5 text-ink-muted">
                <Eye className="size-3.5" />
                the only public facts
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {PUBLIC_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="ds-eyebrow mb-1.5 text-ink-dim">
                      {fact.label}
                    </dt>
                    <dd className="ds-mono text-[13px] text-ink">
                      {fact.copy ? (
                        <Copyable
                          value={fact.value}
                          display={
                            fact.label === "owner address"
                              ? truncAddress(fact.value)
                              : truncMid(fact.value, 6, 6)
                          }
                          className="text-[13px] text-ink"
                        />
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Privacy explainer */}
            <div className="mt-4 flex items-start gap-2.5 px-0.5">
              <Lock className="mt-0.5 size-4 shrink-0 text-ink-dim" />
              <p className="text-[13px] leading-snug text-ink-muted">
                The note stays{" "}
                <span className="text-ink">encrypted and owned by the patient</span>
                . The chief complaint, transcript, and SOAP note are never
                exposed here — only the integrity above is publicly verifiable.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-[18px] flex flex-col gap-2.5 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="ds-mono h-[42px] flex-1 text-[13px]"
                asChild
              >
                <a
                  href={`${NETWORK.explorer}/tx/${DEMO_RECORD.zgStorageRootHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-[15px]" />
                  View on 0G explorer
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="ds-mono h-[42px] flex-1 text-[13px]"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    typeof window !== "undefined" ? window.location.href : "",
                  );
                }}
              >
                <Share2 className="size-[15px]" />
                Share this proof
              </Button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </AppShell>
  );
}
